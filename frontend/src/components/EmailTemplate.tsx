'use client';

import React from 'react';

interface EmailTemplateProps {
  title: string;
  preheader?: string;
  content: React.ReactNode;
  footerText?: string;
}

export default function EmailTemplate({
  title,
  preheader = 'Thank you for your purchase',
  content,
  footerText = '© 2025 Infinite Drive. All rights reserved.'
}: EmailTemplateProps) {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      color: '#333333'
    }}>
      {/* Preheader text (hidden) */}
      <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
        {preheader}
      </div>
      
      {/* Header */}
      <div style={{
        backgroundColor: '#3b82f6', // blue-500
        color: 'white',
        padding: '20px',
        textAlign: 'center',
        borderRadius: '8px 8px 0 0'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>{title}</h1>
      </div>
      
      {/* Content */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '0 0 8px 8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        {content}
      </div>
      
      {/* Footer */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        color: '#666666',
        fontSize: '14px'
      }}>
        <p>{footerText}</p>
        <p>Self-Development and Self-Discipline E-books</p>
      </div>
    </div>
  );
}

// Example usage:
export function OrderConfirmationEmail({
  orderId,
  bookTitle,
  amount,
  currency,
  downloadLink
}: {
  orderId: string;
  bookTitle: string;
  amount: number;
  currency: string;
  downloadLink?: string;
}) {
  return (
    <EmailTemplate
      title="Order Confirmation"
      preheader={`Your order #${orderId} has been confirmed`}
      content={
        <div>
          <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
            Thank you for your purchase! Your payment of {amount} {currency} has been confirmed.
          </p>
          
          <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#0369a1' }}>Order Details</h2>
            <p style={{ margin: '5px 0' }}><strong>Order ID:</strong> {orderId}</p>
            <p style={{ margin: '5px 0' }}><strong>Book:</strong> {bookTitle}</p>
            <p style={{ margin: '5px 0' }}><strong>Amount:</strong> {amount} {currency}</p>
          </div>
          
          {downloadLink && (
            <div style={{ margin: '20px 0' }}>
              <p><strong>Download Link:</strong></p>
              <a 
                href={downloadLink}
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}
              >
                Download Your Book
              </a>
              <p style={{ fontSize: '14px', color: '#666666', marginTop: '10px' }}>
                This link will expire in 24 hours and can only be used once.
              </p>
            </div>
          )}
          
          <p style={{ fontSize: '16px' }}>
            If you have any questions or need assistance, please contact our support team.
          </p>
        </div>
      }
    />
  );
}
