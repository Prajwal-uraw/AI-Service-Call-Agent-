import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/ui/toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from './QueryProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://kestrelvoice.com'),
  title: {
    default: "KestrelVoice - AI Voice Operations Platform for HVAC & Service Businesses",
    template: "%s | KestrelVoice"
  },
  description: "Autonomous voice operations platform proven in HVAC. Answer every call, book appointments instantly, and recover missed revenue. 200ms response time, 24/7 coverage, 40% more bookings.",
  keywords: "KestrelVoice, HVAC AI voice agent, AI receptionist, HVAC call automation, missed calls solution, after-hours answering service, HVAC appointment booking, AI call agent, voice operations platform, HVAC revenue recovery, call handling automation, service business automation, production pilot, live call evaluation",
  authors: [{ name: "KestrelVoice" }],
  creator: "KestrelVoice",
  publisher: "KestrelVoice",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kestrelvoice.com',
    siteName: 'KestrelVoice',
    title: 'KestrelVoice - AI Voice Operations Platform for HVAC & Service Businesses',
    description: 'Autonomous voice operations platform proven in HVAC. Answer every call, book appointments instantly, recover missed revenue. 200ms response, 24/7 coverage.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KestrelVoice - AI Voice Operations Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KestrelVoice - AI Voice Operations for HVAC',
    description: 'Answer every call, book appointments instantly, recover missed revenue. Proven in HVAC with 200ms response time.',
    images: ['/og-image.png'],
    creator: '@kestrelvoice',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/website-favicon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/website-favicon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  other: {
    'application/ld+json': JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'KestrelVoice',
        url: 'https://kestrelvoice.com',
        logo: 'https://kestrelvoice.com/logo.png',
        description: 'Autonomous voice operations platform for HVAC and service businesses',
        sameAs: [
          'https://twitter.com/kestrelvoice',
          'https://linkedin.com/company/kestrelvoice',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Sales',
          url: 'https://kestrelvoice.com/contact',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'KestrelVoice',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '199',
          highPrice: '4900',
          priceCurrency: 'USD',
          offerCount: '4',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '127',
        },
      },
    ]),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <ToastProvider>
                <QueryProvider>
                  {children}
                </QueryProvider>
              </ToastProvider>
            </ErrorBoundary>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
