export const HOSTING_TERM_OPTIONS = [1, 12, 24, 48] as const;

export type HostingPlanSlug = 'profesional' | 'premium' | 'agencia';

export type HostingPlanDefinition = {
  slug: HostingPlanSlug;
  name: string;
  description: string;
  serviceType: 'HOSTING_ONLY';
  packageName: string;
  regularMonthlyPrice: number;
  monthlyPricing: Record<(typeof HOSTING_TERM_OPTIONS)[number], number>;
  maxSites: number;
  storageMb: number;
  bandwidthMb: number;
  mailboxesPerSite: number;
  features: string[];
};

export const HOSTING_PLAN_DEFINITIONS: Record<HostingPlanSlug, HostingPlanDefinition> = {
  profesional: {
    slug: 'profesional',
    name: 'Hosting Profesional',
    description: 'Hosting simple para negocios pequenos que quieren publicar y operar sin complicarse.',
    serviceType: 'HOSTING_ONLY',
    packageName: 'admin_plia-profesional',
    regularMonthlyPrice: 28,
    monthlyPricing: {
      1: 28,
      12: 20,
      24: 18,
      48: 16,
    },
    maxSites: 2,
    storageMb: 5120,
    bandwidthMb: 50000,
    mailboxesPerSite: 1,
    features: [
      'Crea hasta 2 sitios web',
      '5 GB de almacenamiento',
      'SSL incluido',
      '1 mailbox por sitio web',
    ],
  },
  premium: {
    slug: 'premium',
    name: 'Hosting Premium',
    description: 'El plan destacado para operar varios sitios sin ruido tecnico ni paneles confusos.',
    serviceType: 'HOSTING_ONLY',
    packageName: 'admin_plia-premium',
    regularMonthlyPrice: 56,
    monthlyPricing: {
      1: 56,
      12: 40,
      24: 36,
      48: 32,
    },
    maxSites: 5,
    storageMb: 15360,
    bandwidthMb: 150000,
    mailboxesPerSite: 2,
    features: [
      'Crea hasta 5 sitios web',
      '15 GB de almacenamiento',
      'SSL incluido',
      '2 mailbox por sitio web',
    ],
  },
  agencia: {
    slug: 'agencia',
    name: 'Hosting Agencia',
    description: 'Capacidad para equipos y agencias que administran multiples clientes desde una sola cuenta.',
    serviceType: 'HOSTING_ONLY',
    packageName: 'admin_plia-agencia',
    regularMonthlyPrice: 112,
    monthlyPricing: {
      1: 112,
      12: 80,
      24: 72,
      48: 64,
    },
    maxSites: 50,
    storageMb: 102400,
    bandwidthMb: 500000,
    mailboxesPerSite: 5,
    features: [
      'Crea hasta 50 sitios web',
      '100 GB de almacenamiento',
      'SSL incluido',
      '5 mailbox por sitio web',
    ],
  },
};

export function isHostingPlanSlug(value: string): value is HostingPlanSlug {
  return Object.prototype.hasOwnProperty.call(HOSTING_PLAN_DEFINITIONS, value);
}

export function getHostingPlanDefinition(slug: string) {
  return isHostingPlanSlug(slug) ? HOSTING_PLAN_DEFINITIONS[slug] : null;
}

