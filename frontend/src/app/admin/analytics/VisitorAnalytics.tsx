'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface VisitorData {
  totalVisitors: number;
  uniqueVisitors: number;
  conversionRate: number;
  bounceRate: number;
  averageSessionDuration: number;
  visitorsByCountry: {
    country: string;
    count: number;
    percentage: number;
  }[];
  nonPurchasingVisitors: number;
}

export default function VisitorAnalytics() {
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchVisitorData();
    
    // Set up polling for real-time updates (every 60 seconds)
    const intervalId = setInterval(fetchVisitorData, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [period]);

  const fetchVisitorData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const response = await axios.get(`${baseUrl}/admin/analytics/visitors`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: { period }
      });
      
      if (response.status === 200) {
        setVisitorData(response.data);
      } else {
        throw new Error(`Failed to fetch visitor analytics: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching visitor analytics:', error);
      setError('Failed to fetch visitor analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !visitorData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !visitorData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (!visitorData) return null;

  const formatDuration = (seconds: number): string => {
    if (!seconds) return '0m 0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Visitor Analytics</h2>
        <div className="flex items-center space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchVisitorData}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Visitors</p>
              <h3 className="text-2xl font-semibold">{visitorData.totalVisitors.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <h3 className="text-2xl font-semibold">{visitorData.conversionRate.toFixed(1)}%</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bounce Rate</p>
              <h3 className="text-2xl font-semibold">{visitorData.bounceRate.toFixed(1)}%</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg. Session Duration</p>
              <h3 className="text-2xl font-semibold">{formatDuration(visitorData.averageSessionDuration)}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Visitors by Country */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Visitors by Country</h3>
        <div className="space-y-4">
          {visitorData.visitorsByCountry.map((country) => (
            <div key={country.country}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{country.country}</span>
                <span className="text-sm text-gray-500">{country.count.toLocaleString()} ({country.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${country.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Non-Purchasing Visitors */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{visitorData.totalVisitors.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Total Visitors</div>
          </div>
          
          <div className="hidden md:block text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500">{visitorData.nonPurchasingVisitors.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Non-Purchasing Visitors</div>
          </div>
          
          <div className="hidden md:block text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-green-500">{(visitorData.totalVisitors - visitorData.nonPurchasingVisitors).toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">Purchasing Visitors</div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-green-500 h-4" 
              style={{ width: `${visitorData.conversionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>0%</span>
            <span>Conversion Rate: {visitorData.conversionRate.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
