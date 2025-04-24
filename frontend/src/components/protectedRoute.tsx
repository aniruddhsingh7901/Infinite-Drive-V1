import { useRouter } from 'next/navigation';
import { useAuth } from '../context/authContext';
import { useEffect } from 'react';

const PUBLIC_ROUTES = ['/admin/login', '/admin/reset-password'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  useEffect(() => {
    // Allow access to public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
      return;
    }

    // Redirect to login if user is not authenticated
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, pathname, router]);

  // Show a loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render children for authenticated users or public routes
  return <>{children}</>;
}