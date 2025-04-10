'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create axios instance with base URL and default headers
// const api = axios.create({
//   baseURL: 'http://138.197.21.102/api',  // Changed from http://localhost:5000
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// const api = axios.create({
//   baseURL: '/api',  // Use relative path
//   headers: {
//     'Content-Type': 'application/json',
//     'Access-Control-Allow-Origin': '*'
//   },
//   withCredentials: false  // Add this line
// });

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    
    const checkAuth = async () => {
      const token = localStorage?.getItem('token');
      console.log("🚀 ~ useEffect ~ token:", token);
      
      if (token) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://138.197.21.102:5002';
          const response = await axios.get(`${apiUrl}/auth/check-auth`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log("Auth check response:", response.data);
          setUser(response.data.user);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('token');
          setUser(null);
          
          // Check if we're on an admin page and redirect to login
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && 
              !window.location.pathname.includes('/admin/login')) {
            window.location.href = '/admin/login';
          }
        }
      } else {
        // No token found, ensure user is null
        setUser(null);
        
        // Check if we're on an admin page and redirect to login
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin') && 
            !window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://138.197.21.102:5002';
      console.log('Login API URL:', apiUrl);
      
      // Add more detailed logging
      console.log('Sending login request with data:', { email, passwords: password });
      
      const response = await axios.post(`${apiUrl}/auth/login`, { email, passwords: password }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        localStorage?.setItem('token', response.data.token);
        setUser(response.data.user || { email });
        toast.success('Login successful!');
        router.push('/admin');
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Invalid response from server. Please try again.');
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      const err = error as AxiosError<{ message: string }>;
      if (err.response?.status === 401) {
        toast.error('Invalid email or password', {
          style: {
            background: '#FEE2E2',
            color: '#DC2626',
            padding: '16px',
            borderRadius: '8px',
          },
        });
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
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }
    
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
