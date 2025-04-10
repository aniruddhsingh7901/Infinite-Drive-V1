
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PaymentMonitorProps {
  payment: {
    orderId: string;
    timeoutAt: number;
    currency?: string;
  };
  onSuccess: (txHash: string, downloadLink: string, email: string) => void;
  onFailure: () => void;
}

export default function PaymentMonitor({ payment, onSuccess, onFailure }: PaymentMonitorProps) {
  const [timeLeft, setTimeLeft] = useState<number>(Math.max(0, payment.timeoutAt - Date.now()));
  const [status, setStatus] = useState<'pending' | 'confirming' | 'completed'>('pending');
  const [confirmations, setConfirmations] = useState<number>(0);
  const [requiredConfirmations, setRequiredConfirmations] = useState<number>(3);
  const [downloadLink, setDownloadLink] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Set required confirmations based on currency
  useEffect(() => {
    if (payment.currency) {
      const currency = payment.currency.toUpperCase();
      if (currency === 'USDT') {
        setRequiredConfirmations(19);
      } else {
        setRequiredConfirmations(3);
      }
    }
  }, [payment.currency]);

  useEffect(() => {
    // Countdown timer
    timerRef.current = setInterval(() => {
      const newTimeLeft = Math.max(0, payment.timeoutAt - Date.now());
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft === 0) {
        onFailure();
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    // Polling API to check order status
    pollRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/orders/check-status/${payment.orderId}`);
        const data = await response.json();
        console.log("Payment status check:", data);

        if (data.status === 'completed') {
          if (pollRef.current) clearInterval(pollRef.current);
          if (data.downloadLink) {
            setDownloadLink(data.downloadLink);
            setEmail(data.email || '');
            onSuccess(data.txHash, data.downloadLink, data.email);
          }
        } else {
          setStatus(data.status);
          if (data.confirmations) {
            setConfirmations(data.confirmations);
          }
        }
      } catch (error) {
        console.error('Error checking order status:', error);
      }
    }, 15000); // Poll every 15 seconds for faster feedback

    // Cleanup on component unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [payment.orderId, payment.timeoutAt, onFailure, onSuccess]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Time Remaining:</label>
        <div className="text-2xl font-mono">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            status === 'completed' ? 'bg-green-500' :
            status === 'confirming' ? 'bg-blue-500 animate-pulse' :
            'bg-yellow-500 animate-pulse'
          }`} />
          <span className="font-medium">
            {status === 'completed' ? 'Payment Confirmed!' :
             status === 'confirming' ? `Confirming (${confirmations}/${requiredConfirmations})` :
             'Awaiting Payment...'}
          </span>
        </div>
        
        {status === 'confirming' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${Math.min(100, (confirmations / requiredConfirmations) * 100)}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}
