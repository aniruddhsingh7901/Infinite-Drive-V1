'use client';

import { useState, useEffect } from 'react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export default function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
      const response = await fetch(`${baseUrl}/admin/public/faqs`);
      
      if (!response.ok) {
        // If the endpoint doesn't exist yet, use mock data
        const mockFaqs = generateMockFAQs();
        setFaqs(mockFaqs);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(mockFaqs.map(faq => faq.category))) as string[];
        setCategories(uniqueCategories);
      } else {
        const data = await response.json();
        // Only show active FAQs
        const activeFaqs = data.filter((faq: FAQ) => faq.isActive);
        setFaqs(activeFaqs);
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(activeFaqs.map((faq: FAQ) => faq.category))) as string[];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
      
      // Use mock data as fallback
      const mockFaqs = generateMockFAQs();
      setFaqs(mockFaqs);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(mockFaqs.map(faq => faq.category))) as string[];
      setCategories(uniqueCategories);
    } finally {
      setLoading(false);
    }
  };

  const generateMockFAQs = (): FAQ[] => {
    return [
      {
        id: '1',
        question: 'What is Infinite Drive?',
        answer: 'Infinite Drive is a digital product that helps you unlock your full potential and achieve your goals through proven strategies and techniques.',
        category: 'general',
        order: 1,
        isActive: true
      },
      {
        id: '2',
        question: 'How do I access my purchase?',
        answer: 'After completing your purchase, you will receive an email with download instructions. You can also access your purchase from the "Downloads" section of your account.',
        category: 'delivery',
        order: 2,
        isActive: true
      },
      {
        id: '3',
        question: 'What payment methods do you accept?',
        answer: 'We accept credit cards, PayPal, and various cryptocurrencies including Bitcoin, Ethereum, and Litecoin.',
        category: 'payment',
        order: 3,
        isActive: true
      },
      {
        id: '4',
        question: 'Do you offer refunds?',
        answer: 'Due to the digital nature of our products, we do not offer refunds. However, if you encounter any issues with your purchase, please contact our support team.',
        category: 'payment',
        order: 4,
        isActive: true
      },
      {
        id: '5',
        question: 'Can I use Infinite Drive on multiple devices?',
        answer: 'Yes, you can access Infinite Drive on up to 3 devices with a single purchase.',
        category: 'technical',
        order: 5,
        isActive: true
      },
      {
        id: '6',
        question: 'Is my payment information secure?',
        answer: 'Yes, we use industry-standard encryption to protect your payment information. We do not store your credit card details on our servers.',
        category: 'payment',
        order: 6,
        isActive: true
      },
      {
        id: '7',
        question: 'How can I contact support?',
        answer: 'You can contact our support team by emailing support@infinitedrive.com or by using the contact form on our website.',
        category: 'general',
        order: 7,
        isActive: true
      }
    ];
  };

  const toggleFaq = (id: string) => {
    if (openFaqId === id) {
      setOpenFaqId(null);
    } else {
      setOpenFaqId(id);
    }
  };

  const filteredFaqs = faqs
    .filter(faq => activeCategory === 'all' || faq.category === activeCategory)
    .sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        {error}
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No FAQs found in this category.</p>
          ) : (
            filteredFaqs.map(faq => (
              <div 
                key={faq.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      openFaqId === faq.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
                
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    openFaqId === faq.id ? 'max-h-96 py-4' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
