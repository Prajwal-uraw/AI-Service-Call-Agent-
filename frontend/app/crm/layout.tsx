"use client";

import Navigation from "@/components/Navigation";

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
}
