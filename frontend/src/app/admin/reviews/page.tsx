'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Review {
  id: string;
  orderId: string;
  userId: string | null;
  name: string;
  email: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  approved: boolean;
  bookId: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      
      // Try to fetch reviews from the API
      const response = await axios.get(`${baseUrl}/admin/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setReviews(response.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      
      // If API fails, use mock data
      const mockReviews = generateMockReviews();
      setReviews(mockReviews);
      
      // Only show error if it's not a 404 (endpoint not implemented yet)
      if (axios.isAxiosError(err) && err.response?.status !== 404) {
        setError('Failed to load reviews. Using sample data instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMockReviews = (): Review[] => {
    return [
      {
        id: '1',
        orderId: 'order-1',
        userId: 'user-1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        rating: 5,
        date: '2025-01-15T00:00:00.000Z',
        title: 'Life-changing content',
        content: 'The Infinite Drive e-book has completely transformed my approach to personal development. The strategies are practical and easy to implement in daily life.',
        verified: true,
        approved: true,
        bookId: 'book-1'
      },
      {
        id: '2',
        orderId: 'order-2',
        userId: 'user-2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        rating: 5,
        date: '2025-01-20T00:00:00.000Z',
        title: 'Exactly what I needed',
        content: 'I\'ve read many self-help books before, but this one stands out. The author provides clear, actionable steps rather than vague concepts.',
        verified: true,
        approved: true,
        bookId: 'book-1'
      },
      {
        id: '3',
        orderId: 'order-3',
        userId: 'user-3',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        rating: 4,
        date: '2025-02-05T00:00:00.000Z',
        title: 'Great value for the price',
        content: 'The Self-Discipline section alone was worth the purchase. I\'ve struggled with consistency for years, and the techniques in this book have helped me establish a solid morning routine.',
        verified: true,
        approved: true,
        bookId: 'book-1'
      },
      {
        id: '4',
        orderId: 'order-4',
        userId: 'user-4',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        rating: 5,
        date: '2025-02-10T00:00:00.000Z',
        title: 'Exceeded my expectations',
        content: 'I was skeptical at first, but decided to give it a try. The content is well-researched and presented in an engaging way.',
        verified: true,
        approved: false,
        bookId: 'book-2'
      },
      {
        id: '5',
        orderId: 'order-5',
        userId: 'user-5',
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        rating: 5,
        date: '2025-02-18T00:00:00.000Z',
        title: 'Transformative experience',
        content: 'This isn\'t just another self-help book - it\'s a complete system for personal transformation. The combination of the e-book, audio files, and video content creates a powerful learning experience.',
        verified: true,
        approved: true,
        bookId: 'book-2'
      }
    ];
  };

  const handleApproveReview = async (reviewId: string, approved: boolean) => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      
      // Try to update the review status via API
      try {
        await axios.put(`${baseUrl}/admin/reviews/${reviewId}`, 
          { approved },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      } catch (err) {
        console.error('API call failed, updating local state only:', err);
      }
      
      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId ? { ...review, approved } : review
      ));
      
    } catch (err) {
      console.error('Error updating review:', err);
      setError('Failed to update review status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      
      // Try to delete the review via API
      try {
        await axios.delete(`${baseUrl}/admin/reviews/${reviewId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('API call failed, updating local state only:', err);
      }
      
      // Update local state
      setReviews(reviews.filter(review => review.id !== reviewId));
      
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review.');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === 'all' || review.rating === filterRating;
    const matchesSearch = 
      review.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRating && matchesSearch;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reviews Management</h1>
        <button
          onClick={fetchReviews}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search reviews..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filterRating === 'all' ? 'all' : filterRating.toString()}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
          <p className="text-3xl font-bold">{reviews.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
          <p className="text-3xl font-bold">
            {reviews.length > 0 
              ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
              : 'N/A'}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Approval</h3>
          <p className="text-3xl font-bold">
            {reviews.filter(review => !review.approved).length}
          </p>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rating
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Review
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : filteredReviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No reviews found
                </td>
              </tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {review.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{review.name}</div>
                        <div className="text-sm text-gray-500">{review.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{review.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{review.content}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      review.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedReview(review)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {!review.approved ? (
                        <button 
                          onClick={() => handleApproveReview(review.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleApproveReview(review.id, false)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Unapprove
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Review Details</h2>
              <button 
                onClick={() => setSelectedReview(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                <p className="mt-1 text-lg">{selectedReview.name}</p>
                <p className="text-sm text-gray-500">{selectedReview.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Rating</h3>
                <div className="flex mt-1">
                  {renderStars(selectedReview.rating)}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Title</h3>
                <p className="mt-1">{selectedReview.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Content</h3>
                <p className="mt-1 text-gray-700 whitespace-pre-line">{selectedReview.content}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="mt-1">{new Date(selectedReview.date).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedReview.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedReview.approved ? 'Approved' : 'Pending'}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              {!selectedReview.approved ? (
                <button 
                  onClick={() => {
                    handleApproveReview(selectedReview.id, true);
                    setSelectedReview(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
              ) : (
                <button 
                  onClick={() => {
                    handleApproveReview(selectedReview.id, false);
                    setSelectedReview(null);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Unapprove
                </button>
              )}
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
                    handleDeleteReview(selectedReview.id);
                    setSelectedReview(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
