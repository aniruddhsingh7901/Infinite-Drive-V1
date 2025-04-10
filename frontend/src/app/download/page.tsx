'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderConfirmation from '@/components/OrderConfirmation';

// Separate the content into its own component
function DownloadContent() {
  const searchParams = useSearchParams();
  const txHash = searchParams.get('txHash');
  const downloadLink = searchParams.get('link');
  const email = searchParams.get('email');
  const orderId = searchParams.get('orderId');
  const bookTitle = searchParams.get('bookTitle') || 'Your E-book';
  const format = searchParams.get('format') || 'PDF';

  if (!txHash || !downloadLink || !email) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center py-8">
            <div className="rounded-full bg-red-100 p-3 inline-flex mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Error Loading Order Details</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find the information needed to display your download. This could be because:
            </p>
            <ul className="text-left text-gray-600 max-w-md mx-auto mb-6 space-y-2">
              <li>• The download link has expired</li>
              <li>• The link has already been used</li>
              <li>• The URL parameters are incomplete</li>
            </ul>
            <p className="text-gray-600">
              Please check your email for the correct download link or contact customer support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OrderConfirmation
      orderId={orderId || 'Unknown'}
      bookTitle={bookTitle}
      format={format}
      txHash={txHash}
      downloadLink={downloadLink}
      email={email}
    />
  );
}

// Loading component
function LoadingState() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-32 bg-gray-200 rounded w-full mx-auto mt-8"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mt-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function DownloadPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DownloadContent />
    </Suspense>
  );
}
