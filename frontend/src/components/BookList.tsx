'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import BookDisplay from './BookDisplay';

type Book = {
  id: string;
  title: string;
  description: string;
  price: number;
  formats: string[];
  coverImagePaths: string[];
  filePaths: { [key: string]: string };
  bonuses?: {
    title: string;
    description: string;
  }[];
};

export default function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/books`);
        setBooks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-gray-600">Loading books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg max-w-md">
          <h3 className="font-bold text-lg mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-36">
        {books.map((book) => (
          <div key={book.id} className="book-container">
            {/* Book Section with Decorative Elements */}
            <div className="relative">
              {/* Decorative top element */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full"></div>
              
              {/* Book Display Component */}
              <BookDisplay bookId={book.id} />
              
              {/* Decorative bottom element for all books except the last one */}
              {books.indexOf(book) < books.length - 1 && (
                <div className="relative mt-24 mb-12">
                  <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-6 w-24 h-1 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-full"></div>
                  <div className="border-b border-gray-200"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
