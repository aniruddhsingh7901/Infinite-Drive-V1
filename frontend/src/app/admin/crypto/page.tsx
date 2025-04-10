'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@/components/Button';

interface CryptoWallet {
  symbol: string;
  name: string;
  address: string;
  minConfirmations: number;
  processingTime: number; // in minutes
}

export default function CryptoManagement() {
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [editingWallet, setEditingWallet] = useState<CryptoWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    address: '',
    minConfirmations: 0,
    processingTime: 0
  });

  useEffect(() => {
    fetchCryptoWallets();
  }, []);

  const fetchCryptoWallets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${baseUrl}/api/crypto-wallets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setCryptoWallets(response.data);
      
      // Set up polling for real-time updates (every 60 seconds)
      const pollingInterval = setInterval(async () => {
        try {
          const refreshResponse = await axios.get(`${baseUrl}/admin/crypto-wallets`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (refreshResponse.status !== 404) {
            setCryptoWallets(refreshResponse.data);
          }
        } catch (err) {
          console.error('Error refreshing crypto wallets data:', err);
        }
      }, 60000);
      
      // Clean up interval on component unmount
      return () => clearInterval(pollingInterval);
      
    } catch (error) {
      console.error('Error fetching crypto wallets:', error);
      // Use mock data if API fails
      const mockWallets: CryptoWallet[] = [
        { symbol: 'BTC', name: 'Bitcoin', address: 'bc1q7uzjlk8jllu0jpmugn3ruu05ugvf3hgkf70sa0', minConfirmations: 3, processingTime: 60 },
        { symbol: 'LTC', name: 'Litecoin', address: 'LcRBqXocdpFnAgyhMs9fW2FEYmeMhVjhsE', minConfirmations: 3, processingTime: 30 },
        { symbol: 'XMR', name: 'Monero', address: '48edfHu7V9Z84YzzMa6fUueoELZ9ZRXq9VetWzYGzKt52XU5xvqgzYnDK9URnRoJMk1j8nLwEVsaSWJ4fhdUyZijBGUicoD', minConfirmations: 10, processingTime: 60 },
        { symbol: 'SOL', name: 'Solana', address: '42oyJShH4BK98uVew5Fh2MRBPun4Wjb3PWa2aTUNEnbbZNtYPb9hG9cTAcnkPvhDxoFg3zjqDRXwFAmgcxcsygPTVKEKHaq', minConfirmations: 3, processingTime: 5 },
        { symbol: 'DOGE', name: 'Dogecoin', address: 'DGN4D9KUJPCUWWc4JjZKqzKwUwcoxomw7c', minConfirmations: 3, processingTime: 30 },
        { symbol: 'USDT', name: 'Tether', address: 'TCZj7EUmDVjxxKLB88u67khtSou8Cd5cBz', minConfirmations: 19, processingTime: 20 },
        { symbol: 'TRX', name: 'Tron', address: 'UQA_Y4lTk-rfexfxxl2DKKPtgvuFKO69-u52K-kWqDCnO9JD', minConfirmations: 3, processingTime: 5 }
      ];
      setCryptoWallets(mockWallets);
      setError('Failed to fetch crypto wallets from server. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (wallet: CryptoWallet) => {
    setEditingWallet(wallet);
    setFormData({
      address: wallet.address,
      minConfirmations: wallet.minConfirmations,
      processingTime: wallet.processingTime
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallet) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5003';
      
      const response = await axios.put(
        `${baseUrl}/api/crypto-wallets/${editingWallet.symbol}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update the local state
      setCryptoWallets(
        cryptoWallets.map(wallet => 
          wallet.symbol === editingWallet.symbol 
            ? { ...wallet, ...formData } 
            : wallet
        )
      );

      setSuccess(`${editingWallet.name} wallet updated successfully!`);
      setEditingWallet(null);
    } catch (error) {
      console.error('Error updating crypto wallet:', error);
      setError('Failed to update wallet. Please try again.');
      
      // For demo purposes, update the local state anyway
      setCryptoWallets(
        cryptoWallets.map(wallet => 
          wallet.symbol === editingWallet.symbol 
            ? { ...wallet, ...formData } 
            : wallet
        )
      );
      setSuccess(`${editingWallet.name} wallet updated successfully! (Demo mode)`);
      setEditingWallet(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cryptocurrency Management</h1>
        <Button 
          onClick={fetchCryptoWallets}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cryptocurrency
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet Address
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confirmations
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Processing Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cryptoWallets.map((wallet) => (
              <tr key={wallet.symbol}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img 
                        src={`/crypto-icons/${wallet.symbol.toLowerCase()}-logo.svg`} 
                        alt={wallet.name}
                        className="h-10 w-10 rounded-full"
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          (e.target as HTMLImageElement).src = '/crypto-icons/bitcoin-btc-logo.svg';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{wallet.name}</div>
                      <div className="text-sm text-gray-500">{wallet.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono truncate max-w-xs">
                    {wallet.address}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {wallet.minConfirmations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {wallet.processingTime} minutes
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleEdit(wallet)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Wallet Modal */}
      {editingWallet && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Edit {editingWallet.name} Wallet</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Confirmations
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.minConfirmations}
                    onChange={(e) => setFormData({ ...formData, minConfirmations: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of blockchain confirmations required before considering a transaction complete
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Processing Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.processingTime}
                    onChange={(e) => setFormData({ ...formData, processingTime: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated time to process transactions, shown to customers
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-600"
                  onClick={() => setEditingWallet(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className={loading ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  {loading ? 'Updating...' : 'Update Wallet'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
