'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [addingFaq, setAddingFaq] = useState(false);
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 0,
    isActive: true
  });
  const [categories, setCategories] = useState(['general', 'payment', 'delivery', 'technical']);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      
      const response = await fetch(`${baseUrl}/admin/faqs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // If the endpoint doesn't exist yet, use mock data
        const mockFaqs = generateMockFAQs();
        setFaqs(mockFaqs);
      } else {
        const data = await response.json();
        setFaqs(data);
      }
      
      // Set up polling for real-time updates (every 60 seconds)
      const pollingInterval = setInterval(async () => {
        try {
          const refreshResponse = await fetch(`${baseUrl}/admin/faqs`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setFaqs(refreshData);
          }
        } catch (err) {
          console.error('Error refreshing FAQs data:', err);
        }
      }, 60000);
      
      // Clean up interval on component unmount
      return () => clearInterval(pollingInterval);
      
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
      
      // Use mock data as fallback
      const mockFaqs = generateMockFAQs();
      setFaqs(mockFaqs);
    } finally {
      setLoading(false);
    }
  };

  const generateMockFAQs = (): FAQ[] => {
    return [
      {
        id: '1',
        question: 'What is Infinite Drive?',
        answer: 'Infinite Drive is a digital product that helps you unlock your full potential and achieve your goals through proven strategies and techniques.',
        category: 'general',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        question: 'How do I access my purchase?',
        answer: 'After completing your purchase, you will receive an email with download instructions. You can also access your purchase from the "Downloads" section of your account.',
        category: 'delivery',
        order: 2,
        isActive: true
      },
      {
        id: '3',
        question: 'What payment methods do you accept?',
        answer: 'We accept credit cards, PayPal, and various cryptocurrencies including Bitcoin, Ethereum, and Litecoin.',
        category: 'payment',
        order: 3,
        isActive: true
      },
      {
        id: '4',
        question: 'Do you offer refunds?',
        answer: 'Due to the digital nature of our products, we do not offer refunds. However, if you encounter any issues with your purchase, please contact our support team.',
        category: 'payment',
        order: 4,
        isActive: true
      },
      {
        id: '5',
        question: 'Can I use Infinite Drive on multiple devices?',
        answer: 'Yes, you can access Infinite Drive on up to 3 devices with a single purchase.',
        category: 'technical',
        order: 5,
        isActive: true
      },
      {
        id: '6',
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption to protect your payment information. We do not store your credit card details on our servers.',
        category: 'payment',
        order: 6,
        isActive: true
      },
      {
        id: '7',
        question: 'How can I contact support?',
        answer: 'You can contact our support team by emailing support@infinitedrive.com or by using the contact form on our website.',
        category: 'general',
        order: 7,
        isActive: true
      }
    ];
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (editingFaq) {
        // Update existing FAQ
        const updatedFaqs = faqs.map(faq => 
          faq.id === editingFaq.id ? { ...editingFaq } : faq
        );
        setFaqs(updatedFaqs);
        setSuccess('FAQ updated successfully!');
        setEditingFaq(null);
      } else if (addingFaq) {
        // Add new FAQ
        const newId = `faq${Date.now()}`;
        const faqToAdd: FAQ = {
          id: newId,
          question: newFaq.question,
          answer: newFaq.answer,
          category: newFaq.category,
          order: newFaq.order || faqs.length + 1,
          isActive: newFaq.isActive
        };
        
        setFaqs([...faqs, faqToAdd]);
        setSuccess('FAQ added successfully!');
        setAddingFaq(false);
        setNewFaq({
          question: '',
          answer: '',
          category: 'general',
          order: 0,
          isActive: true
        });
      }
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setError('Failed to save FAQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real application, you would call your API to delete the FAQ
      const updatedFaqs = faqs.filter(faq => faq.id !== id);
      setFaqs(updatedFaqs);
      setSuccess('FAQ deleted successfully!');
    } catch (err) {
      console.error('Error deleting FAQ:', err);
      setError('Failed to delete FAQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real application, you would call your API to update the FAQ
      const updatedFaqs = faqs.map(faq => 
        faq.id === id ? { ...faq, isActive } : faq
      );
      setFaqs(updatedFaqs);
      setSuccess(`FAQ ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error('Error updating FAQ:', err);
      setError('Failed to update FAQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  if (loading && faqs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">FAQ Management</h1>
        <button
          onClick={() => {
            setAddingFaq(true);
            setEditingFaq(null);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          Add New FAQ
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search FAQs..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FAQ Form (for adding/editing) */}
      {(addingFaq || editingFaq) && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <form onSubmit={handleSaveFaq} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg"
                value={editingFaq ? editingFaq.question : newFaq.question}
                onChange={(e) => {
                  if (editingFaq) {
                    setEditingFaq({ ...editingFaq, question: e.target.value });
                  } else {
                    setNewFaq({ ...newFaq, question: e.target.value });
                  }
                }}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Answer
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg"
                rows={4}
                value={editingFaq ? editingFaq.answer : newFaq.answer}
                onChange={(e) => {
                  if (editingFaq) {
                    setEditingFaq({ ...editingFaq, answer: e.target.value });
                  } else {
                    setNewFaq({ ...newFaq, answer: e.target.value });
                  }
                }}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={editingFaq ? editingFaq.category : newFaq.category}
                  onChange={(e) => {
                    if (editingFaq) {
                      setEditingFaq({ ...editingFaq, category: e.target.value });
                    } else {
                      setNewFaq({ ...newFaq, category: e.target.value });
                    }
                  }}
                  required
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg"
                  value={editingFaq ? editingFaq.order : newFaq.order || faqs.length + 1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (editingFaq) {
                      setEditingFaq({ ...editingFaq, order: value });
                    } else {
                      setNewFaq({ ...newFaq, order: value });
                    }
                  }}
                  min="1"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={editingFaq ? editingFaq.isActive : newFaq.isActive}
                    onChange={(e) => {
                      if (editingFaq) {
                        setEditingFaq({ ...editingFaq, isActive: e.target.checked });
                      } else {
                        setNewFaq({ ...newFaq, isActive: e.target.checked });
                      }
                    }}
                  />
                  Active
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  setEditingFaq(null);
                  setAddingFaq(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQ List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">FAQs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFaqs.map((faq) => (
                <tr key={faq.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {faq.question}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {faq.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      faq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingFaq(faq)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(faq.id, !faq.isActive)}
                        className={`${
                          faq.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {faq.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
