'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Kestrel - HVAC AI Call Agent" width={160} height={46} priority />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium">
              How It Works
            </Link>
            <Link href="/#pricing" className="text-gray-700 hover:text-blue-600 font-medium">
              Pricing
            </Link>
            <Link href="/calculator" className="text-gray-700 hover:text-blue-600 font-medium">
              ROI Calculator
            </Link>
            <Link href="/demo" className="text-gray-700 hover:text-blue-600 font-medium">
              Live Demo
            </Link>
          </div>
          
          <a 
            href="tel:+15551234567" 
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Phone size={20} />
            <span className="hidden sm:inline">(555) 123-4567</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
