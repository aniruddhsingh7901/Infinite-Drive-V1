// // 'use client';

// import { useEffect } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import { useAuth } from '../context/authContext';

// // const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
// //   const { user, loading } = useAuth();
// //   const router = useRouter();

// //   useEffect(() => {
// //     if (!loading && !user) {
// //       router.push('/admin/login');
// //     }
// //   }, [user, loading, router]);

// //   if (loading) {
// //     return <div>Loading...</div>;
// //   }

// //   if (!user) {
// //     return <div>You are not authorized to view this page.</div>;
// //   }

// //   return <>{children}</>;
// // };

// // 

// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     if (!loading && !user && pathname !== '/admin/login') {
//       router.push('/admin/login');
//     }
//   }, [user, loading, router, pathname]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-xl">Loading...</div>
//       </div>
//     );
//   }

//   return <>{children}</>;
// };

// export default ProtectedRoute;

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/authContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      console.log('User not authenticated, redirecting to login page');
      router.push('/admin/login');
    }
  }, [user, loading, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
