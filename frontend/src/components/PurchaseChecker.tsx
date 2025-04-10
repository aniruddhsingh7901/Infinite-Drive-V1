'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface PurchaseCheckerProps {
  bookId: string;
  email?: string;
  children: (isPurchased: boolean) => React.ReactNode;
}

export default function PurchaseChecker({ bookId, email, children }: PurchaseCheckerProps) {
  const [isPurchased, setIsPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      setIsLoading(true);
      try {
        // Try to get the email from localStorage if not provided
        const userEmail = email || localStorage?.getItem('userEmail');
        
        if (!userEmail) {
          setIsPurchased(false);
          setIsLoading(false);
          return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${apiUrl}/purchase/check-purchase`, {
          params: {
            bookId,
            email: userEmail
          }
        });

        setIsPurchased(response.data.purchased || false);
      } catch (error) {
        console.error('Error checking purchase status:', error);
        setIsPurchased(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPurchaseStatus();
  }, [bookId, email]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children(isPurchased)}</>;
}
