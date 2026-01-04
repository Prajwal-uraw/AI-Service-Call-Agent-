'use client';

import { useState, useEffect } from 'react';
import { Phone, X, Calendar } from 'lucide-react';

export default function MobileCTABar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 50% down the page
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setIsVisible(scrollPercentage > 50 && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slide-up">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
        <div className="relative px-4 py-3">
          <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="text-xs font-semibold mb-2 opacity-90">
            🎯 Experience Our AI Agent
          </div>
          
          <div className="flex gap-2">
            <a
              href="tel:+19388396504"
              className="flex-1 bg-white text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg font-bold text-center transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>(938) 839-6504</span>
            </a>
            <a
              href="/calendar"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-3 rounded-lg transition-all flex items-center justify-center"
              aria-label="Book Demo"
            >
              <Calendar className="w-5 h-5" />
            </a>
          </div>
          
          <div className="text-[10px] text-center mt-2 opacity-75">
            Call now • Free trial • No signup required
          </div>
        </div>
      </div>
    </div>
  );
}
