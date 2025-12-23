import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { ToastProvider } from "@/components/ui/toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kestrel VoiceOps - AI Voice Agent for Home Service Businesses",
  description: "AI voice agents that answer every call, book appointments instantly, and follow up automatically. Built for HVAC, plumbing, and home service businesses.",
  keywords: "Kestrel VoiceOps, Voice Agent, AI receptionist, HVAC automation, missed calls, after-hours calls, home service business, AI call agent, appointment booking",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={inter.className}>
        <ThemeProvider>
          <ErrorBoundary>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
