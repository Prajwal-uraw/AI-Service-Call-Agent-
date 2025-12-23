"use client";

import * as React from "react";

export function Separator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={
        className ??
        "h-px w-full bg-slate-200/70"
      }
    />
  );
}
