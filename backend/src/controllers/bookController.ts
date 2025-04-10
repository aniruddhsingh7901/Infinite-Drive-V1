import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../config/cloudinary';
import Book from '../models/Book';

// Multer configuration
const storage = multer.memoryStorage();
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    console.log("Processing file:", file.fieldname, file.originalname, file.mimetype);
    
    // More permissive approach - check file type by mimetype
    if (file.fieldname === 'coverImage') {
        if (!file.mimetype.startsWith('image/')) {
            console.log("Rejecting cover image:", file.originalname, file.mimetype);
            cb(new Error('Only image files are allowed for cover'));
            return;
        }
    } else if (file.fieldname === 'ebooks') {
        // For ebooks field, accept PDF, EPUB, and common media formats
        if (['application/pdf', 'application/epub+zip'].includes(file.mimetype)) {
            console.log("Accepting ebook file:", file.originalname);
        } 
        else if (file.mimetype.startsWith('audio/') || 
                 file.mimetype.startsWith('video/') || 
                 file.mimetype.startsWith('image/')) {
            // This is likely a bonus file (audio, video, image)
            console.log("Accepting media file as bonus:", file.originalname);
        }
        else {
            // For other types, check if it might be a bonus file by name pattern
            const possibleBonusFile = file.originalname.match(/\.(mp3|mp4|wav|avi|mov|jpg|png|gif)$/i);
            if (possibleBonusFile) {
                console.log("Accepting possible bonus file by extension:", file.originalname);
            } else {
                console.log("Rejecting unknown file type:", file.originalname, file.mimetype);
                cb(new Error('Unsupported file type. Allowed: PDF, EPUB, audio, video, images'));
                return;
            }
        }
    }
    
    console.log("Accepting file:", file.fieldname, file.originalname);
    cb(null, true);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

const uploadToCloudinary = (fileBuffer: Buffer, options: any): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result?.secure_url || '');
        });
        uploadStream.end(fileBuffer);
    });
};

export const addBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    upload.fields([
        { name: 'ebooks', maxCount: 10 }, // Increased maxCount to handle both ebooks and bonus files
        { name: 'coverImage', maxCount: 1 }
    ])(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const { id, title, description, price, formats } = req.body;
            console.log("🚀 ~ ]) ~ req.body:", req.body)
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (!files?.ebooks?.[0] || !files?.coverImage?.[0]) {
                return res.status(400).json({ error: 'Missing required files' });
            }

            // Ensure formats is an array
            const formatArray = typeof formats === 'string' ? formats.split(',') : [];

            // Upload cover image
            const coverImage = await uploadToCloudinary(files.coverImage[0].buffer, {
                folder: 'covers',
                timeout: 300000, // 120 seconds
                public_id: `cover-${uuidv4()}`
            });

            // Upload ebooks in parallel
            const filePaths: { [key: string]: string } = {};
            
            // Only process the first N files as ebooks, where N is the number of formats
            const ebookFiles = files.ebooks.slice(0, formatArray.length);
            
            await Promise.all(ebookFiles.map(async (file, index) => {
                const format = formatArray[index];
                if (!format) {
                    throw new Error('Format is missing for one of the ebooks');
                }

                // Determine folder based on format
                const folder = format.toLowerCase() === 'pdf' ? 'ebooks/pdf' : 'ebooks/epub';

                const result = await uploadToCloudinary(file.buffer, {
                    folder: folder,
                    resource_type: 'raw',
                    timeout: 300000 // 120 seconds
                });
                filePaths[format.toLowerCase()] = result;
            }));
            
                // Process bonus files if any
                let processedBonuses = [];
                if (req.body.bonuses) {
                    try {
                        processedBonuses = JSON.parse(req.body.bonuses);
                        
                        // If there are bonus files to upload (they're included in the ebooks field)
                        if (files.ebooks && files.ebooks.length > formatArray.length) {
                            // Get the ebook files first
                            const ebookFiles = files.ebooks.slice(0, formatArray.length);
                            
                            // The remaining files are bonus files
                            const bonusFiles = files.ebooks.slice(formatArray.length);
                            
                            console.log("Processing bonus files:", bonusFiles.map(f => f.originalname));
                            
                            // For each bonus file
                            for (const bonusFile of bonusFiles) {
                                // Find the corresponding bonus item by filename
                                const matchingBonus = processedBonuses.find((b: any) => b.fileName === bonusFile.originalname);
                                
                                if (matchingBonus) {
                                    console.log("Found matching bonus:", matchingBonus.title, "for file:", bonusFile.originalname);
                                    
                                    // Determine folder based on type
                                    const folder = `bonuses/${matchingBonus.type.toLowerCase()}`;
                                    
                                    try {
                                        // Upload the file
                                        const result = await uploadToCloudinary(bonusFile.buffer, {
                                            folder: folder,
                                            resource_type: matchingBonus.type === 'pdf' ? 'raw' : 'auto',
                                            timeout: 300000 // 300 seconds
                                        });
                                        
                                        // Store the file path
                                        matchingBonus.filePath = result;
                                        
                                        // Remove the fileName property as it's no longer needed
                                        delete matchingBonus.fileName;
                                    } catch (uploadError) {
                                        console.error(`Error uploading bonus file ${bonusFile.originalname}:`, uploadError);
                                        // Continue with other files even if one fails
                                    }
                                    
                                    // Process cover image if it exists
                                    if (matchingBonus.coverImageFileName) {
                                        const coverImageFile = bonusFiles.find(f => f.originalname === matchingBonus.coverImageFileName);
                                        if (coverImageFile) {
                                            try {
                                                const coverImageResult = await uploadToCloudinary(coverImageFile.buffer, {
                                                    folder: 'bonus-covers',
                                                    timeout: 300000 // 300 seconds
                                                });
                                                matchingBonus.coverImagePath = coverImageResult;
                                                delete matchingBonus.coverImageFileName;
                                            } catch (coverUploadError) {
                                                console.error(`Error uploading bonus cover image ${coverImageFile.originalname}:`, coverUploadError);
                                            }
                                        }
                                    }
                                } else {
                                    console.log("No matching bonus found for file:", bonusFile.originalname);
                                }
                            }
                        }
                    } catch (e) {
                        console.error('Error processing bonuses:', e);
                        processedBonuses = [];
                    }
                }
            // const id = bookId
            const book = await Book.create({
                id,
                title,
                description,
                price: parseFloat(price),
                formats: formatArray,
                coverImagePaths: [coverImage],
                filePaths: filePaths,
                bonuses: processedBonuses,
                status: 'active'
            });

            res.status(201).json({
                message: 'Book added successfully',
                book
            });

        } catch (error: any) {
            console.error('Error adding book:', error);
            
            // Provide more detailed error messages based on the error type
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    error: 'Validation error',
                    details: error.errors.map((e: any) => e.message)
                });
            } else if (error.message && error.message.includes('Cloudinary')) {
                return res.status(500).json({
                    error: 'Error uploading files to cloud storage',
                    details: error.message
                });
            } else if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({
                    error: 'File too large',
                    details: 'Maximum file size is 100MB'
                });
            }
            
            res.status(500).json({
                error: error.message || 'Error uploading book',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });
};

export const updateBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    upload.fields([
        { name: 'ebooks', maxCount: 10 }, // Increased maxCount to handle both ebooks and bonus files
        { name: 'coverImage', maxCount: 1 }
    ])(req as any, res, async (err) => {
        if (err) {
            return next(err);
        }
        try {
            const { id } = req.params;
            const { title, description, price, formats, status, bonuses } = req.body;

            const book = await Book.findByPk(id);
            if (!book) {
                res.status(404).json({ message: 'Book not found' });
                return;
            }

            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            const filePaths: { [key: string]: string } = book.filePaths;

            // Ensure formats is an array
            const formatArray = typeof formats === 'string' ? formats.split(',') : [];
            
            if (files && files['ebooks']) {
                // Only process the first N files as ebooks, where N is the number of formats
                const ebookFiles = files['ebooks'].slice(0, formatArray.length);
                
                await Promise.all(formatArray.map(async (format: string, index: number) => {
                    if (index < ebookFiles.length) {
                        const result = await uploadToCloudinary(ebookFiles[index].buffer, {
                            folder: format.toLowerCase() === 'pdf' ? 'ebooks/pdf' : 'ebooks/epub',
                            resource_type: 'raw',
                            timeout: 300000 // 300 seconds
                        });
                        filePaths[format.toLowerCase()] = result;
                    }
                }));
            }

            if (files && files['coverImage']) {
                book.coverImagePaths = await Promise.all(files['coverImage'].map(file =>
                    new Promise<string>((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            {
                                folder: 'covers',
                                timeout: 120000 // 120 seconds
                            },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result?.secure_url || '');
                            }
                        ).end(file.buffer);
                    })
                ));
            }

            book.title = title;
            book.description = description;
            book.price = parseFloat(price);
            book.formats = formatArray;
            book.filePaths = filePaths;
            book.status = status;
            
            // Process bonuses if provided
            if (bonuses) {
                try {
                    let parsedBonuses = typeof bonuses === 'string' ? JSON.parse(bonuses) : bonuses;
                    
                    // If there are bonus files to upload (they're included in the ebooks field)
                    if (files && files['ebooks'] && files['ebooks'].length > formatArray.length) {
                        // Get the ebook files first
                        const ebookFiles = files['ebooks'].slice(0, formatArray.length);
                        
                        // The remaining files are bonus files
                        const bonusFiles = files['ebooks'].slice(formatArray.length);
                        
                        console.log("Processing bonus files for update:", bonusFiles.map(f => f.originalname));
                        
                        // For each bonus file
                        for (const bonusFile of bonusFiles) {
                            // Find the corresponding bonus item by filename
                            const matchingBonus = parsedBonuses.find((b: any) => b.fileName === bonusFile.originalname);
                            const matchingBonusCover = parsedBonuses.find((b: any) => b.coverImageFileName === bonusFile.originalname);
                            
                            if (matchingBonus) {
                                console.log("Found matching bonus for update:", matchingBonus.title, "for file:", bonusFile.originalname);
                                
                                try {
                                    // Determine folder based on type
                                    const folder = `bonuses/${matchingBonus.type.toLowerCase()}`;
                                    
                                    // Upload the file
                                    const result = await uploadToCloudinary(bonusFile.buffer, {
                                        folder: folder,
                                        resource_type: matchingBonus.type === 'pdf' ? 'raw' : 'auto',
                                        timeout: 300000 // 300 seconds
                                    });
                                    
                                    // Store the file path
                                    matchingBonus.filePath = result;
                                    
                                    // Remove the fileName property as it's no longer needed
                                    delete matchingBonus.fileName;
                                } catch (uploadError) {
                                    console.error(`Error uploading bonus file ${bonusFile.originalname}:`, uploadError);
                                    // Continue with other files even if one fails
                                }
                            } else if (matchingBonusCover) {
                                console.log("Found matching bonus cover image:", matchingBonusCover.title, "for file:", bonusFile.originalname);
                                
                                try {
                                    // Upload the cover image
                                    const coverImageResult = await uploadToCloudinary(bonusFile.buffer, {
                                        folder: 'bonus-covers',
                                        timeout: 300000 // 300 seconds
                                    });
                                    
                                    // Store the cover image path
                                    matchingBonusCover.coverImagePath = coverImageResult;
                                    
                                    // Remove the coverImageFileName property as it's no longer needed
                                    delete matchingBonusCover.coverImageFileName;
                                } catch (coverUploadError) {
                                    console.error(`Error uploading bonus cover image ${bonusFile.originalname}:`, coverUploadError);
                                }
                            } else {
                                console.log("No matching bonus found for update file:", bonusFile.originalname);
                            }
                        }
                    }
                    
                    book.bonuses = parsedBonuses;
                } catch (e) {
                    console.error('Error processing bonuses:', e);
                }
            }

            await book.save();

            res.status(200).json({ message: 'Book updated successfully', book });
        } catch (error) {
            next(error);
        }
    });
};
export const getBooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const books = await Book.findAll();
        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};


export const getBookById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        console.log('Looking for book with ID:', id);

        if (!id) {
            console.log('No ID provided');
            res.status(400).json({ message: 'Book ID is required' });
            return;
        }

        const book = await Book.findByPk(id, {
            attributes: [
                'id',
                'title',
                'description',
                'price',
                'formats',
                'filePaths',
                'coverImagePaths',
                'bonuses',
                'status'
            ]
        });

        console.log('Database query result:', book);

        if (!book) {
            console.log('Book not found for ID:', id);
            res.status(404).json({
                message: 'Book not found',
                requestedId: id
            });
            return;
        }

        // Validate book data before sending
        if (!book.formats || !book.coverImagePaths) {
            console.error('Invalid book data:', book);
            res.status(500).json({
                message: 'Invalid book data structure',
                details: 'Missing required fields'
            });
            return;
        }

        const bookData = {
            id: book.id,
            title: book.title,
            description: book.description,
            price: parseFloat(book.price.toString()),
            formats: book.formats,
            filePaths: book.filePaths,
            coverImagePaths: book.coverImagePaths,
            bonuses: book.bonuses,
            status: book.status
        };

        console.log('Sending book data:', bookData);
        res.status(200).json(bookData);

    } catch (error) {
        console.error('Error in getBookById:', error);
        if (error instanceof Error) {
            res.status(500).json({
                message: 'Error fetching book',
                error: error.message
            });
        } else {
            res.status(500).json({
                message: 'Unknown error occurred'
            });
        }
    }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const bookId = req.params.id as string;
        console.log("🚀 ~ deleteBook ~ req.params:", req.params)

        const book = await Book.findOne({ where: { id : bookId} });
         console.log("🚀 ~ deleteBook ~ book:", book)
        if (!book) {
            res.status(404).json({ message: 'Book not found' });
            return;
        }

        await book.destroy();

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        next(error);
    }
};
