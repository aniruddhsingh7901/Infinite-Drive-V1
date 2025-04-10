'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/Button';
import BonusSectionManager from '@/components/BonusSectionManager';

interface BonusItem {
  title: string;
  description: string;
  type?: string;
  file?: File | null;
  filePath?: string;
  coverImage?: File | null;
  coverImagePath?: string;
}

interface BookForm {
  title: string;
  description: string;
  price: string;
  formats: ('PDF' | 'EPUB')[];
  coverImage: File | null;
  bookFiles: {
    PDF?: File;
    EPUB?: File;
  };
  status: 'active' | 'inactive';
  bonuses: BonusItem[];
}

export default function EditBook() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookForm>({
    title: '',
    description: '',
    price: '',
    formats: ['PDF'],
    coverImage: null,
    bookFiles: {},
    status: 'active',
    bonuses: []
  });

  useEffect(() => {
    const fetchBook = async () => {
        const token = localStorage.getItem('token');
      try {
         const response = await axios.get(`https://infinitedriven.com/api/books/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
        const book = response.data;
        setFormData({
          title: book.title,
          description: book.description,
          price: book.price,
          formats: book.formats,
          coverImage: null,
          bookFiles: {},
          status: book.status,
          bonuses: book.bonuses || []
        });
      } catch (error) {
        console.error('Error fetching book:', error);
      }
    };

    fetchBook();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('formats', formData.formats.join(','));
    data.append('status', formData.status);
    
    // Process bonus items
    const processedBonuses = [];
    
    // First, upload any bonus files to Cloudinary
    for (const bonus of formData.bonuses) {
      const bonusData: any = {
        title: bonus.title,
        description: bonus.description,
        type: bonus.type || 'text'
      };
      
      // If there's a file to upload and it's not a text-only bonus
      if (bonus.file && bonus.type && bonus.type !== 'text') {
        // Add the file to FormData for upload - use the same field name as in the backend
        // The backend expects 'ebooks' for ebook files
        data.append('ebooks', bonus.file);
        
        // Store the file name so we can match it on the server
        bonusData.fileName = bonus.file.name;
      } else if (bonus.filePath) {
        // Keep existing file path if available
        bonusData.filePath = bonus.filePath;
      }
      
      // Handle cover image for bonus
      if (bonus.coverImage) {
        data.append('ebooks', bonus.coverImage);
        bonusData.coverImageFileName = bonus.coverImage.name;
      } else if (bonus.coverImagePath) {
        // Keep existing cover image path if available
        bonusData.coverImagePath = bonus.coverImagePath;
      }
      
      processedBonuses.push(bonusData);
    }
    
    // Add processed bonuses as JSON
    if (processedBonuses.length > 0) {
      data.append('bonuses', JSON.stringify(processedBonuses));
    }
    
    if (formData.coverImage) {
      data.append('coverImage', formData.coverImage);
    }
    if (formData.bookFiles.PDF) {
      data.append('ebooks', formData.bookFiles.PDF);
    }
    if (formData.bookFiles.EPUB) {
      data.append('ebooks', formData.bookFiles.EPUB);
    }
   
     
    try {
        const token = localStorage.getItem('token');
        
        console.log("Sending data to server:", {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          formats: formData.formats.join(','),
          bonuses: processedBonuses
        });
        
        // Log the files being uploaded
        console.log("Files being uploaded:", {
          coverImage: formData.coverImage?.name,
          ebooks: Object.entries(formData.bookFiles).map(([format, file]) => `${format}: ${file?.name}`),
          bonusFiles: formData.bonuses
            .filter(item => item.file && item.type !== 'text')
            .map(item => `${item.type}: ${item.file?.name}`)
        });
        
        const response = await axios.put(`https://infinitedriven.com/api/books/${id}`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 120000,
        });
      console.log('Book updated:', response.data);
      router.push('/admin/books');
    } catch (error) {
      console.error('Error updating book:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Book</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Formats
            </label>
            <div className="flex gap-4">
              {['PDF', 'EPUB'].map((format) => (
                <label key={format} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.formats.includes(format as 'PDF' | 'EPUB')}
                    onChange={(e) => {
                      const newFormats = e.target.checked
                        ? [...formData.formats, format as 'PDF' | 'EPUB']
                        : formData.formats.filter(f => f !== format);
                      setFormData({ ...formData, formats: newFormats });
                    }}
                    className="mr-2"
                  />
                  {format}
                </label>
              ))}
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({
                  ...formData,
                  coverImage: e.target.files?.[0] || null
                })}
                className="w-full"
              />
            </div>

            {formData.formats.map((format) => (
              <div key={format}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {format} File
                </label>
                <input
                  type="file"
                  accept={format === 'PDF' ? '.pdf' : '.epub'}
                  onChange={(e) => setFormData({
                    ...formData,
                    bookFiles: {
                      ...formData.bookFiles,
                      [format]: e.target.files?.[0]
                    }
                  })}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Bonus Sections */}
          <BonusSectionManager 
            bonusItems={formData.bonuses}
            onChange={(bonusItems) => setFormData({ ...formData, bonuses: bonusItems })}
            maxBonuses={5}
          />

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              className="bg-gray-500 hover:bg-gray-600"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={loading ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {loading ? 'Updating Book...' : 'Update Book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
