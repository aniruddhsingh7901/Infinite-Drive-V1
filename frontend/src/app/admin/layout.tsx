
'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../components/protectedRoute';
import { useAuth } from '../../context/authContext';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'chart-bar' },
  { href: '/admin/books', label: 'Books', icon: 'book' },
  { href: '/admin/orders', label: 'Orders', icon: 'shopping-cart' },
  { href: '/admin/abandoned-carts', label: 'Abandoned Carts', icon: 'shopping-bag' },
  { href: '/admin/crypto', label: 'Cryptocurrency', icon: 'currency-bitcoin' },
  { href: '/admin/customers', label: 'Customers', icon: 'users' },
  { href: '/admin/faq', label: 'FAQ', icon: 'question-mark-circle' },
  { href: '/admin/settings', label: 'Settings', icon: 'cog' }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
  }) {
   const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { logout } = useAuth();

   if (pathname && pathname.includes('/admin/login')) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <aside className={`bg-white w-64 shadow-md ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
          <div className="p-4">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
          </div>
          <nav className="mt-5">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className="block px-4 py-2 mt-2 text-sm font-semibold text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 mt-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between p-4 bg-white shadow-md">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 focus:outline-none md:hidden"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                ></path>
              </svg>
            </button>
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
