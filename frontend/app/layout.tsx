import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kestrel - HVAC AI Call Agent | Custom AI Receptionist for HVAC Companies",
  description: "Stop losing $200K/year to missed calls. Kestrel is a custom-built AI receptionist that answers in 200ms, books appointments 24/7, and handles emergencies. Live in 48 hours.",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
