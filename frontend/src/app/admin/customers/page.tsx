'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '@/components/Button';

interface Customer {
  id: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  cryptoWallets?: {
    [key: string]: string;
  };
}

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${baseUrl}/admin/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Set the customers data from the API response
      setCustomers(response.data);
      
      // Set up polling for real-time updates (every 30 seconds)
      const pollingInterval = setInterval(async () => {
        try {
          const refreshResponse = await axios.get(`${baseUrl}/admin/customers`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setCustomers(refreshResponse.data);
        } catch (err) {
          console.error('Error refreshing customers data:', err);
          // Don't show error for background refreshes
        }
      }, 30000);
      
      // Clean up interval on component unmount
      return () => clearInterval(pollingInterval);
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      
      // Check if it's an authentication error
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        setError('Authentication error. Please log in again.');
      } 
      // Check if it's a server error
      else if (axios.isAxiosError(error) && error.response && error.response.status >= 500) {
        setError('Server error. Please try again later.');
      }
      // For any other error, show a generic error message
      else {
        setError('Failed to fetch customers from server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportEmails = () => {
    setExportLoading(true);
    
    try {
      // Create CSV content
      const csvContent = 'data:text/csv;charset=utf-8,' + 
        'Email,Total Orders,Total Spent\n' + 
        customers.map(customer => 
          `${customer.email},${customer.totalOrders},${customer.totalSpent}`
        ).join('\n');
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'customer_emails.csv');
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting emails:', error);
      setError('Failed to export emails. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'repeat' && customer.totalOrders > 1) return matchesSearch;
    if (filterStatus === 'single' && customer.totalOrders === 1) return matchesSearch;
    
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={handleExportEmails}
            className="bg-green-600 hover:bg-green-700"
            disabled={exportLoading}
          >
            {exportLoading ? 'Exporting...' : 'Export Email List'}
          </Button>
          <Button 
            onClick={fetchCustomers}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Customers</option>
            <option value="repeat">Repeat Customers</option>
            <option value="single">One-time Customers</option>
          </select>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
          <p className="text-3xl font-bold">{customers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Repeat Customers</h3>
          <p className="text-3xl font-bold">
            {customers.filter(c => c.totalOrders > 1).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">
            ${customers.reduce((sum, customer) => sum + customer.totalSpent, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Order
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {customer.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">ID: {customer.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${customer.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setSelectedCustomer(customer)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Customer Details</h2>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-lg">{selectedCustomer.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer ID</h3>
                <p className="mt-1">{selectedCustomer.id}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Purchase History</h3>
                <div className="mt-1 bg-gray-50 p-3 rounded">
                  <div className="flex justify-between">
                    <span>Total Orders:</span>
                    <span className="font-medium">{selectedCustomer.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Spent:</span>
                    <span className="font-medium">${selectedCustomer.totalSpent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Order Date:</span>
                    <span className="font-medium">{new Date(selectedCustomer.lastOrderDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              {selectedCustomer.cryptoWallets && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Crypto Wallets</h3>
                  <div className="mt-1 space-y-2">
                    {Object.entries(selectedCustomer.cryptoWallets).map(([currency, address]) => (
                      <div key={currency} className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium">{currency}</div>
                        <div className="text-xs font-mono truncate">{address}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setSelectedCustomer(null)}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
