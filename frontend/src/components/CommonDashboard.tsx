'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface RecentCustomer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  joinedDate: string;
}

export default function CommonDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure this only runs in the browser
    if (typeof window !== 'undefined') {
      fetchDashboardData();
      
      // Set up interval to refresh data every 60 seconds
      const intervalId = setInterval(fetchDashboardData, 60000);
      
      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, []);

  const fetchDashboardData = async () => {
    // Safety check to ensure we're in a browser environment
    if (typeof window === 'undefined') return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch real data from API
      const token = localStorage?.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://138.197.21.102:5002';
      console.log('Using API URL:', baseUrl);
      
      // Fetch dashboard stats
      console.log('Fetching dashboard stats...');
      const statsResponse = await fetch(`${baseUrl}/admin/dashboard-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!statsResponse.ok) {
        const errorText = await statsResponse.text();
        console.error('Failed to fetch dashboard stats:', errorText);
        setError(`Failed to fetch dashboard stats: ${statsResponse.status} ${errorText}`);
        setLoading(false);
        return;
      }
      
      const statsData = await statsResponse.json();
      console.log('Dashboard stats data:', statsData);
      
      // Transform the data to match our component's expected format
      let formattedStats: DashboardStats;
      
      try {
        // Safely parse numeric values
        let totalSales = 0;
        try {
          totalSales = typeof statsData.totalSales === 'number' ? 
            statsData.totalSales : 
            (statsData.totalSales ? parseFloat(statsData.totalSales.toString()) : 0);
        } catch (e) {
          console.error('Error parsing totalSales:', e);
        }
        
        let totalOrders = 0;
        try {
          totalOrders = typeof statsData.activeOrders === 'number' ? 
            statsData.activeOrders : 
            (statsData.activeOrders ? parseFloat(statsData.activeOrders.toString()) : 0);
        } catch (e) {
          console.error('Error parsing totalOrders:', e);
        }
        
        let totalCustomers = 0;
        try {
          totalCustomers = typeof statsData.newCustomers === 'number' ? 
            statsData.newCustomers : 
            (statsData.newCustomers ? parseFloat(statsData.newCustomers.toString()) : 0);
        } catch (e) {
          console.error('Error parsing totalCustomers:', e);
        }
        
        formattedStats = {
          totalSales: isNaN(totalSales) ? 0 : totalSales,
          totalOrders: isNaN(totalOrders) ? 0 : totalOrders,
          totalCustomers: isNaN(totalCustomers) ? 0 : totalCustomers,
          pendingOrders: isNaN(totalOrders) ? 0 : totalOrders
        };
      } catch (e) {
        console.error('Error formatting stats:', e);
        formattedStats = {
          totalSales: 0,
          totalOrders: 0,
          totalCustomers: 0,
          pendingOrders: 0
        };
      }
      
      console.log('Formatted stats:', formattedStats);
      
      setStats(formattedStats);
      
      // Fetch recent orders
      console.log('Fetching recent orders...');
      const ordersResponse = await fetch(`${baseUrl}/admin/orders/recent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!ordersResponse.ok) {
        const errorText = await ordersResponse.text();
        console.error('Failed to fetch recent orders:', errorText);
        setError(`Failed to fetch recent orders: ${ordersResponse.status} ${errorText}`);
        setLoading(false);
        return;
      }
      
      const ordersData = await ordersResponse.json();
      console.log('Recent orders data:', ordersData);
      
      if (!Array.isArray(ordersData)) {
        console.error('Orders data is not an array:', ordersData);
        setError('Invalid orders data format received from server');
        setLoading(false);
        return;
      }
      
      // Transform the orders data to match our component's expected format
      const formattedOrders: RecentOrder[] = (Array.isArray(ordersData) ? ordersData : []).map((order: any) => {
        // Ensure order is an object
        if (!order || typeof order !== 'object') {
          return {
            id: 'Unknown',
            customer: 'Unknown',
            product: 'Unknown',
            amount: 0,
            status: 'pending' as 'completed' | 'pending' | 'failed',
            date: new Date().toISOString().split('T')[0]
          };
        }
        
        // Parse amount safely
        let amount = 0;
        try {
          amount = typeof order.amount === 'number' ? 
            order.amount : 
            (order.amount ? parseFloat(order.amount.toString()) : 0);
        } catch (e) {
          console.error('Error parsing amount:', e);
          amount = 0;
        }
        
        return {
          id: order.id || 'Unknown',
          customer: order.customerEmail || order.email || 'Unknown',
          product: order.bookId || 'Unknown', // bookId now contains the book title from the backend
          amount: amount,
          status: (order.status || 'pending') as 'completed' | 'pending' | 'failed',
          date: new Date(order.createdAt || Date.now()).toISOString().split('T')[0]
        };
      }).slice(0, 5); // Limit to 5 orders
      
      console.log('Formatted orders:', formattedOrders);
      
      setRecentOrders(formattedOrders);
      
      // Fetch recent customers
      console.log('Fetching recent customers...');
      const customersResponse = await fetch(`${baseUrl}/admin/customers/recent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!customersResponse.ok) {
        const errorText = await customersResponse.text();
        console.error('Failed to fetch recent customers:', errorText);
        setError(`Failed to fetch recent customers: ${customersResponse.status} ${errorText}`);
        setLoading(false);
        return;
      }
      
      const customersData = await customersResponse.json();
      console.log('Recent customers data:', customersData);
      
      if (!Array.isArray(customersData)) {
        console.error('Customers data is not an array:', customersData);
        setError('Invalid customers data format received from server');
        setLoading(false);
        return;
      }
      
      // Transform the customers data to match our component's expected format
      const formattedCustomers: RecentCustomer[] = (Array.isArray(customersData) ? customersData : []).map((customer: any) => {
        // Ensure customer is an object
        if (!customer || typeof customer !== 'object') {
          return {
            id: 'Unknown',
            name: 'Unknown',
            email: 'Unknown',
            totalSpent: 0,
            joinedDate: new Date().toISOString().split('T')[0]
          };
        }
        
        // Parse totalSpent safely
        let totalSpent = 0;
        try {
          totalSpent = typeof customer.totalSpent === 'number' ? 
            customer.totalSpent : 
            (customer.totalSpent ? parseFloat(customer.totalSpent.toString()) : 0);
        } catch (e) {
          console.error('Error parsing totalSpent:', e);
          totalSpent = 0;
        }
        
        return {
          id: customer.id || 'Unknown',
          name: customer.email ? customer.email.split('@')[0] : 'Unknown', // Use part of email as name
          email: customer.email || 'Unknown',
          totalSpent: totalSpent,
          joinedDate: new Date(customer.lastOrderDate || Date.now()).toISOString().split('T')[0]
        };
      }).slice(0, 5); // Limit to 5 customers
      
      console.log('Formatted customers:', formattedCustomers);
      
      setRecentCustomers(formattedCustomers);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-semibold">${stats?.totalSales.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-500">Real-time data</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-semibold">{stats?.totalOrders}</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-500">Real-time data</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <h3 className="text-2xl font-semibold">{stats?.totalCustomers}</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-500">Real-time data</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Orders</p>
              <h3 className="text-2xl font-semibold">{stats?.pendingOrders}</h3>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-sm text-yellow-500">Needs attention</span>
          </div>
        </div>
      </div>

      {/* Recent Orders & Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Customers</h2>
            <Link href="/admin/customers" className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/books/add" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="p-2 bg-blue-100 rounded-full mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <span className="text-sm font-medium">Add New Book</span>
          </Link>
          
          <Link href="/admin/orders" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <span className="text-sm font-medium">View Orders</span>
          </Link>
          
          <Link href="/admin/analytics" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="p-2 bg-purple-100 rounded-full mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <span className="text-sm font-medium">View Analytics</span>
          </Link>
          
          <Link href="/admin/settings" className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <div className="p-2 bg-yellow-100 rounded-full mr-3">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
