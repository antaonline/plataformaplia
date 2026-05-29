import React from 'react';
import { Toaster } from "@/components/ui/toaster";

export default function ExperimentalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="experimental-context min-h-screen font-sans">
      {children}
      <Toaster />
    </div>
  );
}
