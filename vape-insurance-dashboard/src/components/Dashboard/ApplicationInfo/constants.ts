export const APPLICATION_STATUS = {
  COMPLETED: 'completed',
  APPROVED: 'approved',
  UNDER_REVIEW: 'under_review',
  SUBMITTED: 'submitted',
  PAYMENT_PENDING: 'payment_pending',
  REJECTED: 'rejected',
  DRAFT: 'draft',
} as const;

export const STATUS_COLORS = {
  [APPLICATION_STATUS.COMPLETED]: 'green',
  [APPLICATION_STATUS.APPROVED]: 'green',
  [APPLICATION_STATUS.UNDER_REVIEW]: 'blue',
  [APPLICATION_STATUS.SUBMITTED]: 'blue',
  [APPLICATION_STATUS.PAYMENT_PENDING]: 'orange',
  [APPLICATION_STATUS.REJECTED]: 'red',
  [APPLICATION_STATUS.DRAFT]: 'default',
} as const;

export const STATUS_TEXT = {
  [APPLICATION_STATUS.COMPLETED]: 'Active',
  [APPLICATION_STATUS.APPROVED]: 'Approved',
  [APPLICATION_STATUS.UNDER_REVIEW]: 'Under Review',
  [APPLICATION_STATUS.SUBMITTED]: 'Submitted',
  [APPLICATION_STATUS.PAYMENT_PENDING]: 'Payment Pending',
  [APPLICATION_STATUS.REJECTED]: 'Rejected',
  [APPLICATION_STATUS.DRAFT]: 'Draft',
} as const;
