'use client';

import React from 'react';
import Link from 'next/link';
import Button from './Button';

interface OrderConfirmationProps {
  orderId: string;
  bookTitle: string;
  format: string;
  txHash: string;
  downloadLink?: string;
  email: string;
}

export default function OrderConfirmation({
  orderId,
  bookTitle,
  format,
  txHash,
  downloadLink,
  email
}: OrderConfirmationProps) {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Thank You for Your Purchase!</h1>
          <p className="text-gray-600">
            Your payment has been confirmed. Below are your order details and download link.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Order Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Book:</span>
              <span className="font-medium">{bookTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <span className="font-medium">{format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{email}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Transaction Hash:</label>
            <div className="text-sm font-mono bg-gray-50 p-3 rounded border overflow-x-auto">
              {txHash}
            </div>
          </div>

          {downloadLink && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Download Link:</label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <a 
                  href={downloadLink} 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Download Your Book
                </a>
                <span className="text-sm text-gray-500">
                  (Link expires in 24 hours)
                </span>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600 mt-6 p-4 bg-yellow-50 rounded-lg">
            <p className="font-medium text-yellow-800 mb-2">Important:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-700">
              <li>A copy of this download link has been sent to your email.</li>
              <li>The download link can only be used once.</li>
              <li>If you encounter any issues, please contact our support team.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button className="px-8 py-3">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
