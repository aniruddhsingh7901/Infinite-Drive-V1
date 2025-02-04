

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import axios from 'axios';

// const menuItems = [
//   { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
//   { href: '/admin/books', label: 'Books', icon: 'book' },
//   { href: '/admin/orders', label: 'Orders', icon: 'shopping-cart' },
//   { href: '/admin/settings', label: 'Settings', icon: 'cog' }
// ];

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const [isSidebarOpen, setSidebarOpen] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       router.push('/admin/login');
//     }
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     router.push('/admin/login');
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-200 ease-in-out ${
//         isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//       }`}>
//         <div className="flex flex-col h-full">
//           {/* Admin Header */}
//           <div className="flex items-center justify-between px-4 py-6 border-b border-gray-800">
//             <h1 className="text-xl font-bold text-white">Admin Panel</h1>
//             <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
//               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-1 px-4 py-6 space-y-2">
//             {menuItems.map((item) => (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
//               >
//                 <span>{item.label}</span>
//               </Link>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className={`lg:pl-64 transition-all duration-200 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
//         <header className="bg-white shadow-sm">
//           <div className="flex items-center justify-between px-4 py-4">
//             <button
//               onClick={() => setSidebarOpen(!isSidebarOpen)}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//             <div className="flex items-center space-x-4">
//               <button className="text-gray-500 hover:text-gray-700">
//                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
//                 </svg>
//               </button>
//               <div className="relative">
//                 <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
//                   <div className="w-8 h-8 rounded-full bg-gray-200"></div>
//                   <span>Admin</span>
//                 </button>
//               </div>
//               <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
//                 Logout
//               </button>
//             </div>
//           </div>
//         </header>

//         <main className="p-6">{children}</main>
//       </div>
//     </div>
//   );
// }
'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../components/protectedRoute';
import { useAuth } from '../../context/authContext';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/books', label: 'Books', icon: 'book' },
  { href: '/admin/orders', label: 'Orders', icon: 'shopping-cart' },
  // { href: '/admin/settings', label: 'Settings', icon: 'cog' }
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

   if (pathname === '/admin/login') {
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