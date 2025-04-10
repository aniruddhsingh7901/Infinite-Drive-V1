// 'use client';

// import { useSearchParams, useRouter } from 'next/navigation';
// import CryptoPayment from '@/components/CryptoPayment';

// export default function PaymentProcessPage() {
//   const searchParams = useSearchParams();
//   // const router = useRouter();
  
//   const orderId = searchParams.get('orderId') || '';
//   const currency = searchParams.get('currency') || '';
//   const address = searchParams.get('address') || '';
//   const qrData = searchParams.get('qrData') || '';
//   console.log("🚀 ~ PaymentProcessPage ~ qrData:", qrData)
//   const amount = parseFloat(searchParams.get('amount') || '0');

//   return (
//     <div className="min-h-screen bg-gray-50 py-12">
//       <CryptoPayment
//         orderId={orderId}
//         currency={currency}
//         address={address}
//         amount={amount}
//         qrData= {qrData}
//         expiresIn={3600} // 30 minutes
      
//       />
//     </div>
//   );
// }

'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CryptoPayment from '@/components/CryptoPayment';

// Payment content component
function PaymentContent() {
  const searchParams = useSearchParams();
  
  const orderId = searchParams.get('orderId') || '';
  const currency = searchParams.get('currency') || '';
  const address = searchParams.get('address') || '';
  const qrData = searchParams.get('qrData') || '';
  const amount = parseFloat(searchParams.get('amount') || '0');
  const bookTitle = searchParams.get('bookTitle') || '';
  const format = searchParams.get('format') || '';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">
            Follow the instructions below to complete your payment
          </p>
        </div>
        
        <CryptoPayment
          orderId={orderId}
          currency={currency}
          address={address}
          amount={amount}
          qrData={qrData}
          expiresIn={3600}
        />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Having trouble? Contact our support team for assistance.</p>
        </div>
      </div>
    </div>
  );
}

// Loading component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function PaymentProcessPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentContent />
    </Suspense>
  );
}
