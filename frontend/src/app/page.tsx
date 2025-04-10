'use client';

import BookList from "@/components/BookList";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import ReviewsSection from "@/components/ReviewsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl shadow-xl p-8 mb-12 text-white overflow-hidden relative">
            {/* Animated elements in background */}
            <div className="absolute inset-0 opacity-10 overflow-hidden">
              <div className="absolute top-10 left-10 w-20 h-20 text-yellow-500 animate-pulse">₿</div>
              <div className="absolute top-40 left-40 w-16 h-16 text-blue-400 animate-pulse delay-300">Ξ</div>
              <div className="absolute top-20 right-20 w-24 h-24 text-yellow-500 animate-pulse delay-700">₿</div>
              <div className="absolute bottom-20 right-40 w-16 h-16 text-blue-400 animate-pulse delay-500">Ξ</div>
              <div className="absolute bottom-40 left-20 w-20 h-20 text-yellow-500 animate-pulse delay-1000">₿</div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <img src="/1000163336.png" alt="Infinite Drive Logo" className="h-16 w-16 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  Infinite <span className="text-blue-400">Drive</span>
                </h1>
              </div>
              <p className="text-xl max-w-2xl mx-auto mb-8 text-center">
                The ultimate library for digital knowledge seekers - <br/>
                <span className="font-semibold">powered by crypto, driven by innovation</span>
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center">
                  <span className="text-yellow-400 mr-2">₿</span> Bitcoin Accepted
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center">
                  <span className="text-blue-400 mr-2">Ξ</span> Ethereum Accepted
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center">
                  <span className="text-green-400 mr-2">$</span> USDT Accepted
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 flex items-center">
                  <span className="text-purple-400 mr-2">◎</span> Solana Accepted
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premium Digital Knowledge Collection
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Self-development, crypto insights, and financial wisdom - all in one place
            </p>
          </div>

          {/* Display All Books Vertically */}
          <div className="bg-white rounded-2xl shadow-lg">
            <BookList />
          </div>
        </div>
        
        {/* Reviews Section */}
        <ReviewsSection />
        
        {/* FAQ Section */}
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
