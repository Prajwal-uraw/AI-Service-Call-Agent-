import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$199 Production Pilot - Live HVAC Call Handling Evaluation | KestrelVoice',
  description: 'Deploy KestrelVoice on your real business number for 7 days. Measure calls answered, jobs booked, and after-hours coverage. $199 paid production evaluation—not a demo.',
  keywords: [
    'HVAC production pilot',
    'live call handling test',
    'HVAC answering service trial',
    'AI voice agent evaluation',
    'HVAC call automation pilot',
    'production call handling',
    'HVAC missed calls solution',
    'after-hours call coverage',
    'HVAC appointment booking',
    'call center alternative HVAC',
    'revenue leakage analysis',
    'HVAC call metrics',
    'live phone system test',
    'HVAC operational efficiency'
  ].join(', '),
  openGraph: {
    title: '$199 Production Pilot - Recover Missed HVAC Revenue',
    description: 'Live production evaluation on your real business line. Measure performance, book jobs, capture after-hours calls. 7-day pilot with executive report.',
    url: 'https://kestrelvoice.com/production-pilot',
    siteName: 'KestrelVoice',
    images: [
      {
        url: '/og-production-pilot.png',
        width: 1200,
        height: 630,
        alt: 'KestrelVoice Production Pilot - Live HVAC Call Handling',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '$199 Production Pilot - Live HVAC Call Evaluation',
    description: 'Deploy on your real business number. Measure calls answered, jobs booked, revenue recovered. 7-day production pilot.',
    images: ['/og-production-pilot.png'],
  },
  alternates: {
    canonical: 'https://kestrelvoice.com/production-pilot',
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
};
