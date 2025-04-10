'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${baseUrl}/orders/all-orders`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("🚀 ~ fetchOrders ~ response:", response);
        
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
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

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
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.bookId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.format}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
