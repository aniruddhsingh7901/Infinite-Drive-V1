'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string, otp?: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/','/admin/login', '/admin/reset-password','/contact'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage?.getItem('token');

      if (token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://138.197.21.102:5002';
          const response = await axios.get(`${apiUrl}/auth/check-auth`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setUser(null);

          // Redirect to login if not on a public route
          if (!PUBLIC_ROUTES.includes(window.location.pathname)) {
            router.push('/admin/login');
          }
        }
      } else {
        setUser(null);

        // Redirect to login if not on a public route
        if (!PUBLIC_ROUTES.includes(window.location.pathname)) {
          router.push('/admin/login');
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const login = async (email: string, password: string, otp?: string) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://138.197.21.102:5002';
      const requestData = otp ? { email, passwords: password, otp } : { email, passwords: password };

      const response = await axios.post(`${apiUrl}/auth/login`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.data.requiresOTP) {
        toast.success('OTP sent to your email');
        return response.data;
      }

      if (response.data && response.data.token) {
        localStorage?.setItem('token', response.data.token);
        setUser(response.data.user || { email });
        toast.success('Login successful!');
        router.push('/admin');
        return response.data;
      } else {
        toast.error('Invalid response from server. Please try again.');
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      if (err.response?.status === 401) {
        toast.error('Invalid email or password');
      } else if (err.code === 'ECONNABORTED') {
        toast.error('Connection timeout. Please check your internet connection and try again.');
      } else if (err.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your internet connection and try again.');
      } else {
        toast.error('An error occurred. Please try again later.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage?.removeItem('token');
    setUser(null);
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};