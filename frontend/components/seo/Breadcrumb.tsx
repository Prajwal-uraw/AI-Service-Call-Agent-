import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <ol className="flex items-center gap-2 text-sm text-neutral-600">
        <li className="flex items-center gap-2">
          <Link 
            href="/" 
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <>
                  <Link 
                    href={item.href}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </>
              ) : (
                <span className={isLast ? 'text-neutral-900 font-semibold' : ''}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Helper function to generate BreadcrumbList schema
export function generateBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string = 'https://kestrelai.com') {
  const itemListElement = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': baseUrl
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 2,
      'name': item.label,
      'item': item.href ? `${baseUrl}${item.href}` : undefined
    }))
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': itemListElement
  };
}
