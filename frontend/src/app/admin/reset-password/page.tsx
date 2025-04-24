'use client';
import dynamic from 'next/dynamic';

// Dynamically import the ResetPassword component with SSR disabled
const ResetPasswordComponent = dynamic(() => import('../../../components/ResetPasswordComponent'), { ssr: false });

export default function Page() {
  return <ResetPasswordComponent />;
}