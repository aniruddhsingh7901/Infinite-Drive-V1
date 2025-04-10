'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import VisitorAnalytics from './VisitorAnalytics';

// Define types for our analytics data
interface AnalyticsData {
  salesByPeriod: {
    period: string;
    amount: number;
  }[];
  topSellingBooks: {
    id: string;
    title: string;
    sales: number;
    revenue: number;
  }[];
  customerAcquisition: {
    period: string;
    count: number;
  }[];
  conversionRates: {
    source: string;
    rate: number;
  }[];
  paymentMethods: {
    method: string;
    count: number;
    amount: number;
  }[];
}

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
    
    // Set up polling for real-time updates (every 60 seconds)
    const intervalId = setInterval(fetchAnalyticsData, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [period]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${baseUrl}/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics data: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalyticsData(data);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
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

  // Calculate total sales
  const totalSales = analyticsData?.salesByPeriod.reduce((sum, item) => sum + item.amount, 0) || 0;
  
  // Calculate total customers
  const totalCustomers = analyticsData?.customerAcquisition.reduce((sum, item) => sum + item.count, 0) || 0;
  
  // Calculate average order value
  const totalOrders = analyticsData?.topSellingBooks.reduce((sum, item) => sum + item.sales, 0) || 1;
  const averageOrderValue = totalSales / totalOrders;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchAnalyticsData}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading}
            title="Refresh data"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Sales</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold">${totalSales.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Total Customers</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold">{totalCustomers.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Average Order Value</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold">${averageOrderValue.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500">Conversion Rate</div>
            <div className="mt-2 flex items-baseline">
              <div className="text-2xl font-semibold">{analyticsData?.conversionRates[0]?.rate.toFixed(1) || 0}%</div>
            </div>
          </div>
      </div>

      {/* Sales Over Time Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Sales Over Time</h2>
        <div className="h-64">
          {/* In a real application, you would use a charting library like Chart.js or Recharts */}
          <div className="flex h-48 items-end space-x-2">
            {analyticsData?.salesByPeriod.map((item, index) => {
              const maxAmount = Math.max(...analyticsData.salesByPeriod.map(i => i.amount));
              const height = (item.amount / maxAmount) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="text-xs mt-2 text-gray-500">{item.period}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Selling Books */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Top Selling Books</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData?.topSellingBooks.map((book) => (
                <tr key={book.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${book.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Acquisition & Conversion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Customer Acquisition</h2>
          </div>
          <div className="p-6">
            {analyticsData?.customerAcquisition.map((item, index) => {
              const maxCount = Math.max(...analyticsData.customerAcquisition.map(i => i.count));
              const width = (item.count / maxCount) * 100;
              
              return (
                <div key={index} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.period}</span>
                    <span className="text-sm font-medium text-gray-700">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Conversion Rates</h2>
          </div>
          <div className="p-6">
            {analyticsData?.conversionRates.map((item, index) => {
              const maxRate = Math.max(...analyticsData.conversionRates.map(i => i.rate));
              const width = (item.rate / maxRate) * 100;
              
              return (
                <div key={index} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.source}</span>
                    <span className="text-sm font-medium text-gray-700">{item.rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visitor Analytics */}
      <div className="mt-8 mb-8">
        <VisitorAnalytics />
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Payment Methods</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData?.paymentMethods.map((method, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {method.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {method.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${method.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
