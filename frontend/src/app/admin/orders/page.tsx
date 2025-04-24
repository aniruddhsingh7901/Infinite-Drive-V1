'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Order {
  id: string;
  customerEmail: string;
  bookId: any;
  format: 'PDF' | 'EPUB';
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  date: any;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    fetchOrders();
    setupWebSocket();
    
    // Cleanup WebSocket connection when component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
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
          // Refresh orders when an order is updated
          fetchOrders();
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
        setupWebSocket();
      }, 5000);
    };
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Try to use the admin-specific endpoint first
      try {
        const adminResponse = await axios.get(`${baseUrl}/admin/orders/all`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (adminResponse.data && Array.isArray(adminResponse.data)) {
          // Format the orders data
          const formattedOrders = adminResponse.data.map((order: any) => ({
            id: order.id,
            customerEmail: order.customerEmail || order.email,
            bookId: order.bookTitle || order.bookId,
            format: order.format,
            amount: order.amount,
            paymentMethod: order.paymentMethod || order.payment_currency,
            status: order.status,
            date: order.date || order.createdAt
          }));
          
          setOrders(formattedOrders);
          return; // Exit if admin endpoint works
        }
      } catch (adminError) {
        console.log('Admin endpoint not available, falling back to regular endpoint');
      }
      
      // Fallback to the regular orders endpoint
      const response = await axios.get(`${baseUrl}/orders/all-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Format the orders data
        const formattedOrders = response.data.map((order: any) => ({
          id: order.id,
          customerEmail: order.email,
          bookId: order.bookId,
          format: order.format,
          amount: order.amount,
          paymentMethod: order.payment_currency,
          status: order.status,
          date: order.createdAt
        }));
        
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BookId</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerEmail}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.bookId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.format}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.paymentMethod}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.date).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
