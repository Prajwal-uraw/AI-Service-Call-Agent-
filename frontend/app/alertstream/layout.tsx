import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AlertStream - Instant SMS Notifications for Your Website',
  description: 'Get instant text alerts for critical website events. Simple setup, powerful automation.',
  keywords: 'SMS notifications, website alerts, form notifications, real-time alerts',
};

export default function AlertStreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={inter.className}>
      {children}
    </div>
  );
}
