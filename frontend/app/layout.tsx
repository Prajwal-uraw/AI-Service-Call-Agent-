import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kestrel AI - Demand Engine",
  description: "AI-powered demand generation and lead qualification",
  keywords: "Kestrel, HVAC AI, AI receptionist, HVAC automation, missed calls, after-hours calls, HVAC business, AI call agent",
  icons: {
    icon: '/favicon.png',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <Navigation />
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
