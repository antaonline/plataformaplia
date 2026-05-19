import React from 'react';
import * as Icons from 'lucide-react';

export const Icon = ({ name, className, size = 24 }: { name: string, className?: string, size?: number }) => {
  const LucideIcon = (Icons as any)[name];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} size={size} />;
};