export const VERIFICATION_STATUS = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  FAILED: 'failed',
  UNVERIFIED: 'unverified',
} as const;

export const VERIFICATION_COLORS = {
  [VERIFICATION_STATUS.VERIFIED]: 'green',
  [VERIFICATION_STATUS.PENDING]: 'orange',
  [VERIFICATION_STATUS.FAILED]: 'red',
  [VERIFICATION_STATUS.UNVERIFIED]: 'gray',
} as const;

export const VERIFICATION_TEXT = {
  [VERIFICATION_STATUS.VERIFIED]: 'Verified',
  [VERIFICATION_STATUS.PENDING]: 'Pending',
  [VERIFICATION_STATUS.FAILED]: 'Failed',
  [VERIFICATION_STATUS.UNVERIFIED]: 'Unverified',
} as const;

export const FIELD_LABELS = {
  PHONE: 'Phone Number',
  EMAIL: 'Email Address',
  PAN: 'PAN Number',
  AADHAAR: 'Aadhaar Number',
  BANK_ACCOUNT: 'Bank Account',
  MEMBER_SINCE: 'Member Since',
  ACCOUNT_STATUS: 'Account Status',
} as const;

export const MESSAGES = {
  NO_USER_DATA: 'No user data available',
  LOAD_ERROR: 'Failed to load verification status',
  NOT_PROVIDED: 'Not provided',
  TITLE: 'Personal Information',
} as const;

export const ACCOUNT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

export const DATE_FORMAT_OPTIONS = {
  year: 'numeric' as const,
  month: 'long' as const,
  day: 'numeric' as const,
};
