/**
 * Application-wide constants for RespiraShield Landing Page
 */

export const SITE_CONFIG = {
  name: 'RespiraShield Insurance',
  description: 'Specialized health coverage for vape users',
  url: 'https://respirashield.com',
  email: 'support@respirashield.com',
  phone: '+91 80 5550 1234',
  address: 'Bengaluru, Karnataka, India',
} as const

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/respirashield',
  linkedin: 'https://linkedin.com/company/respirashield',
  instagram: 'https://instagram.com/respirashield',
} as const

export const ROUTES = {
  home: '/',
  register: 'https://app.respirashield.com/',
  about: '/about',
  claims: '/claims',
  privacy: '/privacy',
  terms: '/terms',
} as const

export const INSURANCE_PLANS = [
  {
    id: 1,
    name: 'Basic',
    price: 149,
    description: 'Perfect for getting started',
    features: [
      'Basic health coverage',
      'Device protection up to ₹10,000',
      'Emergency support',
      'Online consultations',
      'Email support',
    ],
  },
  {
    id: 2,
    name: 'Premium',
    price: 299,
    description: 'Most popular choice',
    features: [
      'Extended health coverage',
      'Device protection up to ₹20,000',
      '24/7 priority support',
      'Specialist consultations',
      'Health check-ups',
      'Wellness rewards program',
    ],
    popular: true,
  },
  {
    id: 3,
    name: 'Complete',
    price: 499,
    description: 'Comprehensive protection',
    features: [
      'Comprehensive health coverage',
      'Device protection up to ₹25,000',
      'Dedicated support manager',
      'All consultation types',
      'Annual health package',
      'Family coverage options',
      'Legal liability protection',
    ],
  },
] as const
