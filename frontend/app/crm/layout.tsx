"use client";

import CrmShell from "@/components/CrmShell";

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CrmShell>{children}</CrmShell>
  );
}
