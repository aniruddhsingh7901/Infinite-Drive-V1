'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/Button';
import BonusSectionManager from '@/components/BonusSectionManager';
import { v4 as uuidv4 } from 'uuid';

interface BonusItem {
  title: string;
  description: string;
  type?: string;
  file?: File | null;
  coverImage?: File | null;
  coverImagePath?: string;
}

interface BookForm {
  bookId: string;
  title: string;
  description: string;
  heading: string;
  subheading: string;
  price: string;
  formats: ('pdf' | 'epub')[];
  coverImage: File | null;
  ebooks: {
    pdf?: File;
    epub?: File;
  };
  bonusItems: BonusItem[];
}

export default function AddBook() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<BookForm>({
    bookId:'',
    title: '',
    description: '',
    heading: '',
    subheading: '',
    price: '',
    formats: ['pdf'],
    coverImage: null,
    ebooks: {},
    bonusItems: [] as BonusItem[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      // Form validation
      if (!formData.title || !formData.description || !formData.price) {
        throw new Error('Please fill in all required fields');
      }

      if (!formData.coverImage) {
        throw new Error('Cover image is required');
      }

      // Create FormData
      const data = new FormData();
      console.log("🚀 ~ handleSubmit ~ data:", data)
      
      // Generate a clean book ID without format suffixes
       const bookId = uuidv4();
      
      // Add basic info
      data.append('id', bookId); // Add the ID to form data
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('heading', formData.heading);
      data.append('subheading', formData.subheading);
      data.append('price', formData.price);
      data.append('formats', formData.formats.join(','));

      // Add cover image
      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }

      // Add book files using correct field name
      formData.formats.forEach(format => {
        const file = formData.ebooks[format];
        if (file) {
          // Use the exact field name expected by multer
          data.append('ebooks', file);
        }
      });
      
      // Process bonus items
      const processedBonuses = [];
      
      // First, upload any bonus files to Cloudinary
      for (const bonus of formData.bonusItems) {
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
        }
        
        // Handle cover image for bonus
        if (bonus.coverImage) {
          data.append('ebooks', bonus.coverImage);
          bonusData.coverImageFileName = bonus.coverImage.name;
        }
        
        processedBonuses.push(bonusData);
      }
      
      // Add processed bonuses as JSON
      if (processedBonuses.length > 0) {
        data.append('bonuses', JSON.stringify(processedBonuses));
      }

      // Make API call to backend
      const token = localStorage.getItem('token');
      console.log("Sending data to server:", {
        id: bookId,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        formats: formData.formats.join(','),
        bonuses: processedBonuses
      });
      
      // Log the files being uploaded
      console.log("Files being uploaded:", {
        coverImage: formData.coverImage?.name,
        ebooks: Object.entries(formData.ebooks).map(([format, file]) => `${format}: ${file?.name}`),
        bonusFiles: formData.bonusItems
          .filter(item => item.file && item.type !== 'text')
          .map(item => `${item.type}: ${item.file?.name}`)
      });
      
      const response = await axios.post('https://infinitedriven.com/api/books/add', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        timeout: 120000, 
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(percentCompleted);
        },
      });
      console.log("🚀 ~ handleSubmit ~ response:", response)

      console.log('Book added successfully:', response.data);
      router.push('/admin/books');

    } catch (error) {
      console.error('Error adding book:', error);
      
      if (axios.isAxiosError(error)) {
        console.log("Error response:", error.response?.data);
        const message = error.response?.data?.error || error.response?.data?.message || 'Error uploading book';
        if (error.response?.status === 413) {
          alert('File size too large - Maximum size is 100MB');
        } else if (error.response?.status === 400) {
          alert(`Bad request: ${message}`);
        } else {
          alert(`Server error (${error.response?.status || 'unknown'}): ${message}`);
        }
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Book</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
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
                Description *
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
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
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
              Available Formats *
            </label>
            <div className="flex gap-4">
              {['pdf', 'epub'].map((format) => (
                <label key={format} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.formats.includes(format as 'pdf' | 'epub')}
                    onChange={(e) => {
                      const newFormats = e.target.checked
                        ? [...formData.formats, format as 'pdf' | 'epub']
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

          {/* Additional Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heading
              </label>
              <input
                type="text"
                value={formData.heading}
                onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Main marketing heading"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subheading
              </label>
              <input
                type="text"
                value={formData.subheading}
                onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Supporting subheading text"
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image *
              </label>
              <input
                type="file"
                accept="image/*"
                required
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
                  {format} File *
                </label>
                <input
                  type="file"
                  accept={format === 'pdf' ? '.pdf' : '.epub'}
                  required
                  onChange={(e) => setFormData({
                    ...formData,
                    ebooks: {
                      ...formData.ebooks,
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
            bonusItems={formData.bonusItems}
            onChange={(bonusItems) => setFormData({ ...formData, bonusItems })}
            maxBonuses={5}
          />

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              className="bg-gray-500 hover:bg-gray-600"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? `Uploading ${uploadProgress}%` : 'Add Book'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
