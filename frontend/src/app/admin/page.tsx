'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/authContext';
import axios from 'axios';

interface DashboardStats {
  totalSales: number;
  activeOrders: number;
  newCustomers: number;
  revenueGrowth: number;
  conversionRate?: number;
  completedOrders?: number;
  pendingOrders?: number;
  dailyOrders?: any[];
  recentOrders?: any[];
}

interface RecentOrder {
  id: string;
  customerEmail: string;
  bookTitle: string;
  status: string;
  amount: number;
  currency?: string;
}

export default function AdminDashboard() {
  const [isClient, setIsClient] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    activeOrders: 0,
    newCustomers: 0,
    revenueGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setIsClient(true);

    // Check if user is authenticated
    if (!loading && !user) {
      console.log('User not authenticated in admin dashboard, redirecting to login');
      router.push('/admin/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      setupWebSocket();
    }

    // Cleanup WebSocket connection when component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  const setupWebSocket = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws/admin';

    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
      // Authenticate as admin
      ws.send(JSON.stringify({
        type: 'auth',
        role: 'admin',
        token: localStorage.getItem('token')
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('WebSocket message received:', message);

        // Handle different message types
        if (message.event === 'order_update') {
          // Refresh dashboard data when an order is updated
          fetchDashboardData();
        } else if (message.event === 'dashboard_update') {
          // Refresh dashboard data when dashboard update is triggered
          fetchDashboardData();
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (user) {
          setupWebSocket();
        }
      }, 5000);
    };
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // Fetch dashboard stats
      const statsResponse = await axios.get(`${baseUrl}/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Fetch recent orders
      const ordersResponse = await axios.get(`${baseUrl}/admin/orders/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
        // Process the recent orders
        const recent = ordersResponse.data.map((order: any) => ({
          id: order.id,
          customerEmail: order.customerEmail || order.email,
          bookTitle: order.bookTitle || order.bookId,
          status: order.status,
          amount: order.amount,
          currency: order.paymentCurrency // Include the currency
        }));

        setRecentOrders(recent);
      } else {
        // Fallback to direct orders endpoint if admin/orders/recent fails
        try {
          const fallbackResponse = await axios.get(`${baseUrl}/orders/all-orders`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
            // Get the 5 most recent orders
            const recent = fallbackResponse.data
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((order: any) => ({
                id: order.id,
                customerEmail: order.email,
                bookTitle: order.bookId,
                status: order.status,
                amount: order.amount
              }));

            setRecentOrders(recent);
          }
        } catch (fallbackError) {
          console.error('Error fetching orders from fallback endpoint:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient || loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Only render the actual dashboard content on the client side
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Total Sales</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-semibold">
              ${typeof stats.totalSales === 'string'
                ? parseFloat(stats.totalSales).toFixed(2)
                : (stats.totalSales || 0).toFixed(2)}
            </div>
            <div className={`text-sm ${(stats.revenueGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(stats.revenueGrowth || 0) >= 0 ? '+' : ''}
              {typeof stats.revenueGrowth === 'string'
                ? parseFloat(stats.revenueGrowth).toFixed(1)
                : (stats.revenueGrowth || 0).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Active Orders</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-semibold">{stats.activeOrders || 0}</div>
            <div className="text-sm text-green-500">+0%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">New Customers</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-semibold">{stats.newCustomers || 0}</div>
            <div className="text-sm text-green-500">+0%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="text-sm text-gray-500">Conversion Rate</div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-semibold">
              {stats.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : '3.2%'}
            </div>
            <div className="text-sm text-green-500">+0%</div>
          </div>
        </div>
      </div>

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


      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.customerEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.bookTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {typeof order.amount === 'string' ? parseFloat(order.amount) : order.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.currency || 'USD'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center" colSpan={6}>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
