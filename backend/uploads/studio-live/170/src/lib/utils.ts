import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...classes: (string | undefined | null | false)[]) {
  return twMerge(clsx(classes));
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