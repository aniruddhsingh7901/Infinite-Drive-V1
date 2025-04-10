'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Button from './Button';

type Bonus = {
  title: string;
  description: string;
  type?: string;
  filePath?: string;
};

type Book = {
  id: string;
  title: string;
  coverImagePaths: string[];
};

interface BonusDisplayProps {
  bookId: string;
  bonuses: Bonus[];
  isPurchased: boolean;
  onPurchaseClick: () => void;
}

export default function BonusDisplay({ 
  bookId, 
  bonuses, 
  isPurchased, 
  onPurchaseClick 
}: BonusDisplayProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/books/${bookId}`);
        setBook({
          id: response.data.id,
          title: response.data.title,
          coverImagePaths: response.data.coverImagePaths
        });
      } catch (error) {
        console.error('Error fetching book:', error);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleUnlockClick = (bonus: Bonus) => {
    if (!isPurchased) {
      setSelectedBonus(bonus);
      setShowPurchaseModal(true);
    }
  };

  const handleDownload = (filePath: string) => {
    window.open(filePath, '_blank');
  };

  const closeModal = () => {
    setShowPurchaseModal(false);
    setSelectedBonus(null);
  };

  if (!book) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Bonus Content Header with Decorative Element */}
      <div className="relative z-10 flex items-center mb-6">
        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold ml-4 text-gray-800">Exclusive Bonus Content</h3>
        <div className="ml-4 h-0.5 flex-grow bg-gradient-to-r from-blue-500 to-transparent"></div>
      </div>
      
      {/* Bonus Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bonuses.map((bonus, index) => {
          // Determine bonus type and icon
          let bonusIcon;
          let bonusColor;
          let bonusGradient;
          
          if (bonus.type) {
            const type = bonus.type.toLowerCase();
            
            if (type === 'pdf') {
              bonusIcon = (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18H17V16H7V18Z" fill="currentColor" />
                  <path d="M17 14H7V12H17V14Z" fill="currentColor" />
                  <path d="M7 10H11V8H7V10Z" fill="currentColor" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor" />
                </svg>
              );
              bonusColor = "text-red-600";
              bonusGradient = "from-red-500 to-red-700";
            } else if (type === 'audio') {
              bonusIcon = (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18Z" fill="currentColor" />
                  <path d="M6 10C6.55228 10 7 10.4477 7 11V13C7 13.5523 6.55228 14 6 14C5.44772 14 5 13.5523 5 13V11C5 10.4477 5.44772 10 6 10Z" fill="currentColor" />
                  <path d="M18 10C18.5523 10 19 10.4477 19 11V13C19 13.5523 18.5523 14 18 14C17.4477 14 17 13.5523 17 13V11C17 10.4477 17.4477 10 18 10Z" fill="currentColor" />
                </svg>
              );
              bonusColor = "text-green-600";
              bonusGradient = "from-green-500 to-green-700";
            } else if (type === 'video') {
              bonusIcon = (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4 5C4 3.34315 5.34315 2 7 2H17C18.6569 2 20 3.34315 20 5V19C20 20.6569 18.6569 22 17 22H7C5.34315 22 4 20.6569 4 19V5ZM7 4H17C17.5523 4 18 4.44772 18 5V19C18 19.5523 17.5523 20 17 20H7C6.44772 20 6 19.5523 6 19V5C6 4.44772 6.44772 4 7 4Z" fill="currentColor" />
                  <path d="M15 12L10 9V15L15 12Z" fill="currentColor" />
                </svg>
              );
              bonusColor = "text-purple-600";
              bonusGradient = "from-purple-500 to-purple-700";
            } else {
              // Default icon for other types
              bonusIcon = (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="currentColor" />
                  <path d="M12 7C12.5523 7 13 7.44772 13 8V12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12V8C11 7.44772 11.4477 7 12 7Z" fill="currentColor" />
                  <path d="M11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16Z" fill="currentColor" />
                </svg>
              );
              bonusColor = "text-blue-600";
              bonusGradient = "from-blue-500 to-blue-700";
            }
          } else {
            // Default icon if no type is specified
            bonusIcon = (
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
                <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="currentColor" />
              </svg>
            );
            bonusColor = "text-blue-600";
            bonusGradient = "from-blue-500 to-blue-700";
          }
          
          return (
            <div 
              key={index} 
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1"
            >
              {/* Book Cover Image */}
              <div className="relative h-48 overflow-hidden">
                {book.coverImagePaths && book.coverImagePaths.length > 0 ? (
                  <Image 
                    src={book.coverImagePaths[0]} 
                    alt={book.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                )}
                
                {/* Overlay with bonus type icon */}
                <div className={`absolute inset-0 bg-gradient-to-t ${bonusGradient} opacity-70`}></div>
                <div className="absolute top-4 right-4 bg-white rounded-full p-2">
                  <div className={bonusColor}>
                    {bonusIcon}
                  </div>
                </div>
              </div>
              
              {/* Bonus Content */}
              <div className="p-5">
                <h4 className="text-lg font-bold text-gray-800 mb-2">{bonus.title}</h4>
                <p className="text-gray-600 mb-4">{bonus.description}</p>
                
                {/* Unlock/Download Button */}
                {isPurchased && bonus.filePath ? (
                  <button
                    onClick={() => handleDownload(bonus.filePath!)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Bonus
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlockClick(bonus)}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Unlock Bonus
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedBonus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Unlock "{selectedBonus.title}"</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              To access this exclusive bonus content, you need to purchase the book first. After your purchase, all bonus content will be unlocked and available for download.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                {book.coverImagePaths && book.coverImagePaths.length > 0 ? (
                  <div className="relative w-16 h-24 mr-4">
                    <Image 
                      src={book.coverImagePaths[0]} 
                      alt={book.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-24 bg-gray-200 rounded-md mr-4"></div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{book.title}</h4>
                  <p className="text-sm text-gray-500">Includes all bonus content</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={onPurchaseClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-md"
              >
                Purchase Book to Unlock
              </Button>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
