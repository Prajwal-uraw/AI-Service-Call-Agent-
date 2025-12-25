'use client';

import { ReactNode } from 'react';

interface ContentSectionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  background?: 'white' | 'gray' | 'gradient';
  className?: string;
}

export default function ContentSection({
  id,
  title,
  subtitle,
  children,
  background = 'white',
  className = ''
}: ContentSectionProps) {
  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-neutral-50',
    gradient: 'bg-gradient-to-b from-white to-neutral-50'
  };

  return (
    <section id={id} className={`py-20 md:py-24 ${bgClasses[background]} ${className}`}>
      <div className="container mx-auto px-6 max-w-6xl">
        {(title || subtitle) && (
          <div className="text-center mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
