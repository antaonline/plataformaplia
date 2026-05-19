import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: string[]) {
  return twMerge(clsx(inputs));
}

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};