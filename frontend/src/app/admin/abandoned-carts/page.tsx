'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import axios from 'axios';

interface AbandonedCart {
  id: string;
  email: string;
  bookId: string;
  format: string;
  amount: number;
  payment_currency: string;
  createdAt: string;
  reminderSent: boolean;
  reminderSentAt: string | null;
  recovered: boolean;
  recoveredAt: string | null;
  book?: {
    title: string;
    author: string;
    price: number;
  };
}

interface AbandonedCartStats {
  totalCarts: number;
  recoveredCarts: number;
  recoveryRate: number;
  potentialRevenueLost: number;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<AbandonedCartStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [markingRecovered, setMarkingRecovered] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAbandonedCarts();
    fetchAbandonedCartStats();
  }, []);

  const fetchAbandonedCarts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${baseUrl}/admin/abandoned-carts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCarts(response.data);
    } catch (err) {
      console.error('Error fetching abandoned carts:', err);
      setError('Failed to load abandoned carts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAbandonedCartStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${baseUrl}/admin/abandoned-carts/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching abandoned cart stats:', err);
      // Don't set error state here to avoid blocking the main cart list
    }
  };

  const sendReminder = async (cartId: string) => {
    try {
      setSendingReminder(cartId);
      
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      await axios.post(`${baseUrl}/admin/abandoned-carts/${cartId}/send-reminder`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh the cart list
      fetchAbandonedCarts();
      fetchAbandonedCartStats();
      
      alert('Reminder email sent successfully!');
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Failed to send reminder email. Please try again.');
    } finally {
      setSendingReminder(null);
    }
  };

  const markAsRecovered = async (cartId: string) => {
    try {
      setMarkingRecovered(cartId);
      
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      await axios.post(`${baseUrl}/admin/abandoned-carts/${cartId}/mark-recovered`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh the cart list
      fetchAbandonedCarts();
      fetchAbandonedCartStats();
      
      alert('Cart marked as recovered successfully!');
    } catch (err) {
      console.error('Error marking cart as recovered:', err);
      alert('Failed to mark cart as recovered. Please try again.');
    } finally {
      setMarkingRecovered(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Abandoned Carts</h1>
        <button
          onClick={() => {
            fetchAbandonedCarts();
            fetchAbandonedCartStats();
          }}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          title="Refresh data"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Abandoned Carts</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold">{stats.totalCarts}</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Recovered Carts</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold">{stats.recoveredCarts}</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Recovery Rate</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold">{stats.recoveryRate.toFixed(1)}%</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Potential Revenue Lost</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold">${stats.potentialRevenueLost.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Abandoned Carts Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {carts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No abandoned carts found
                  </td>
                </tr>
              ) : (
                carts.map((cart) => (
                  <tr key={cart.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{cart.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cart.book?.title || `Book ID: ${cart.bookId}`}</div>
                      <div className="text-sm text-gray-500">Format: {cart.format}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${cart.amount}</div>
                      <div className="text-sm text-gray-500">{cart.payment_currency}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(cart.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(cart.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cart.recovered ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Recovered
                        </span>
                      ) : cart.reminderSent ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Reminder Sent
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Abandoned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!cart.recovered && (
                        <>
                          <button
                            onClick={() => sendReminder(cart.id)}
                            disabled={cart.reminderSent || sendingReminder === cart.id}
                            className={`text-blue-600 hover:text-blue-900 mr-4 ${
                              (cart.reminderSent || sendingReminder === cart.id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {sendingReminder === cart.id ? 'Sending...' : 'Send Reminder'}
                          </button>
                          <button
                            onClick={() => markAsRecovered(cart.id)}
                            disabled={markingRecovered === cart.id}
                            className={`text-green-600 hover:text-green-900 ${
                              markingRecovered === cart.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {markingRecovered === cart.id ? 'Updating...' : 'Mark Recovered'}
                          </button>
                        </>
                      )}
                      {cart.recovered && (
                        <span className="text-gray-500">
                          Recovered on {new Date(cart.recoveredAt!).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
