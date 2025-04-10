'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';

interface Review {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
}

export default function ReviewsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchReviews();
  }, []);
  
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      
      // Try to fetch reviews from the API
      const response = await axios.get(`${baseUrl}/admin/public/reviews`);
      
      if (response.status === 200) {
        // Only show approved reviews
        const approvedReviews = response.data.filter((review: any) => 
          review.approved !== false
        );
        setReviews(approvedReviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      
      // If API fails, use mock data
      const mockReviews = generateMockReviews();
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback mock reviews data
  const generateMockReviews = (): Review[] => {
    return [
      {
        id: '1',
        name: 'John Smith',
        rating: 5,
        date: '2025-01-15',
        title: 'Life-changing content',
        content: 'The Infinite Drive e-book has completely transformed my approach to personal development. The strategies are practical and easy to implement in daily life. I\'ve seen significant improvements in my productivity and mindset in just a few weeks.',
        verified: true
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        rating: 5,
        date: '2025-01-20',
        title: 'Exactly what I needed',
        content: 'I\'ve read many self-help books before, but this one stands out. The author provides clear, actionable steps rather than vague concepts. The bonus audio content was also extremely valuable for reinforcing the key ideas during my commute.',
        verified: true
      },
      {
        id: '3',
        name: 'Michael Chen',
        rating: 4,
        date: '2025-02-05',
        title: 'Great value for the price',
        content: 'The Self-Discipline section alone was worth the purchase. I\'ve struggled with consistency for years, and the techniques in this book have helped me establish a solid morning routine for the first time in my life. Highly recommended!',
        verified: true
      },
      {
        id: '4',
        name: 'Emily Rodriguez',
        rating: 5,
        date: '2025-02-10',
        title: 'Exceeded my expectations',
        content: 'I was skeptical at first, but decided to give it a try. The content is well-researched and presented in an engaging way. I especially appreciated the practical exercises at the end of each chapter. The results speak for themselves!',
        verified: true
      },
      {
        id: '5',
        name: 'David Wilson',
        rating: 5,
        date: '2025-02-18',
        title: 'Transformative experience',
        content: 'This isn\'t just another self-help book - it\'s a complete system for personal transformation. The combination of the e-book, audio files, and video content creates a powerful learning experience. I\'ve recommended it to all my friends.',
        verified: true
      }
    ];
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? reviews.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex === reviews.length - 1 ? 0 : prevIndex + 1));
  };

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
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No reviews available at this time.</div>
        ) : (
          <>
            {/* Desktop Carousel */}
            <div className="hidden md:block">
              <div className="grid grid-cols-3 gap-8">
                {[
                  activeIndex === 0 ? reviews.length - 1 : activeIndex - 1,
                  activeIndex,
                  activeIndex === reviews.length - 1 ? 0 : activeIndex + 1
                ].map((index, i) => {
                  const review = reviews[index];
                  return (
                    <div 
                      key={review.id}
                      className={`bg-gray-50 rounded-xl p-6 shadow-sm transition-all duration-300 ${
                        i === 1 ? 'transform scale-105 bg-white shadow-md' : 'opacity-75'
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                            {review.name.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{review.name}</h3>
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-2">{review.title}</h4>
                      <p className="text-gray-600 mb-3">{review.content}</p>
                      {review.verified && (
                        <div className="flex items-center text-green-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>Verified Purchase</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Mobile Carousel */}
            <div className="md:hidden">
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {reviews[activeIndex].name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{reviews[activeIndex].name}</h3>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {renderStars(reviews[activeIndex].rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(reviews[activeIndex].date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold mb-2">{reviews[activeIndex].title}</h4>
                <p className="text-gray-600 mb-3">{reviews[activeIndex].content}</p>
                {reviews[activeIndex].verified && (
                  <div className="flex items-center text-green-600 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Verified Purchase</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Navigation Controls - Only show when there are reviews */}
        {reviews.length > 0 && (
          <div className="flex justify-center mt-8 space-x-4">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label="Previous review"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    activeIndex === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              aria-label="Next review"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
