'use client';
import { useState } from 'react';
import { useAuth } from '../../../context/authContext';
import Button from '../../../components/Button';
import axios from 'axios';

export default function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Attempting login with email:', email);
      
      // If OTP is required, include it in the login request
      if (requiresOtp) {
        await login(email, password, otp);
      } else {
        const result = await login(email, password);
        
        // If login returns requiresOTP flag, show OTP input
        if (result?.requiresOTP) {
          setRequiresOtp(true);
          setMessage('Please enter the OTP sent to your email');
          setLoading(false);
          return;
        }
      }
      
      console.log('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://138.197.21.102:5002';
      const response = await axios.post(`${apiUrl}/auth/forgot-password`, { email: forgotEmail });
      
      // For testing purposes, we're getting the token directly from the response
      // In production, this would be sent via email
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
        setShowResetPassword(true);
        setShowForgotPassword(false);
      }
      
      setMessage('If your email is registered, you will receive a password reset link');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://138.197.21.102:5002';
      const response = await axios.post(`${apiUrl}/auth/reset-password`, {
        token: resetToken,
        newPassword
      });
      
      setMessage('Password reset successful');
      setShowResetPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
    } catch (error: any) {
      console.error('Reset password error:', error);
      setMessage(error.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        
        {message && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded">
            {message}
          </div>
        )}

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
        
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
        
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm w-full"
            >
              Back to Login
            </button>
          </form>
        ) : showResetPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
        
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
        
            <button
              type="button"
              onClick={() => {
                setShowResetPassword(false);
                setShowForgotPassword(true);
              }}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm w-full"
            >
              Back to Forgot Password
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            {requiresOtp && (
              <div>
                <label className="block text-sm font-medium mb-1">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                  placeholder="Enter the 6-digit code"
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm w-full"
            >
              Forgot Password?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
