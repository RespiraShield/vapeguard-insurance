export const PLAN_MESSAGES = {
  PENDING_TITLE: 'Awesome! You\'ve Opted for Your Plan',
  PENDING_MESSAGE: 'Great choice! Your insurance plan selection has been received. We\'re getting everything ready for you.',
  INFO_TITLE: 'What\'s Next?',
  INFO_MESSAGE: 'We\'ll notify you once your plan is ready for activation. You can update your payment details anytime to get started faster!',
  ACTIVATION_PROGRESS_LABEL: 'Activation Progress',
} as const;

export const ACTIVATION_STEPS = {
  PLAN_SELECTED: {
    title: 'Plan Selected',
    description: 'You\'ve chosen your insurance plan',
  },
  DETAILS_VERIFIED: {
    completed: {
      title: 'Details Verified',
      description: 'Your information is confirmed',
    },
    pending: {
      title: 'Details Pending',
      description: 'Awaiting information verification',
    },
  },
  PAYMENT: {
    completed: {
      title: 'Payment Completed',
      description: 'Your plan is now active',
    },
    pending: {
      title: 'Payment Pending',
      description: 'Complete payment to activate',
    },
  },
} as const;

export const PLAN_HIGHLIGHTS = {
  COMPREHENSIVE: {
    title: 'Comprehensive Coverage',
    description: 'All-in-one protection',
  },
  INSTANT: {
    title: 'Instant Activation',
    description: 'No waiting period',
  },
  SUPPORT: {
    title: 'Premium Support',
    description: '24/7 assistance',
  },
} as const;

export const PROGRESS_CONFIG = {
  PERCENT: 66,
  STROKE_COLOR: {
    '0%': '#108ee9',
    '100%': '#87d068',
  },
  STATUS: 'active' as const,
} as const;
