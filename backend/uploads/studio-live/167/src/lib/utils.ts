// /lib/utils.ts

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilidad para combinar clases CSS de forma concisa y consistente
export function cn(...inputs: Array<string | undefined | null | boolean>) {
  return twMerge(clsx(inputs));
}

// Variantes de animación para uso compartido
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