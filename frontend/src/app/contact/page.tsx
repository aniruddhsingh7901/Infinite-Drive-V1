'use client';

import { useEffect } from 'react';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help! Fill out the form below and our support team will get back to you as soon as possible.
            </p>
          </div>
          
          <ContactForm />
          
          <div className="mt-16 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">How quickly will I receive a response?</h3>
                <p className="mt-2 text-gray-600">
                  We strive to respond to all inquiries within 24 hours during business days. For urgent matters, please mention "Urgent" in your subject line.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800">I'm having trouble with my download. What should I do?</h3>
                <p className="mt-2 text-gray-600">
                  If you're experiencing issues with your download, please include your order number and a description of the problem in your message. This will help us resolve your issue more quickly.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Do you offer refunds?</h3>
                <p className="mt-2 text-gray-600">
                  Due to the digital nature of our products, we do not offer refunds. However, if you encounter any issues with your purchase, please contact our support team and we'll do our best to assist you.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Can I use Infinite Drive on multiple devices?</h3>
                <p className="mt-2 text-gray-600">
                  Yes, you can access Infinite Drive on up to 3 devices with a single purchase. If you need to use it on additional devices, please contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
