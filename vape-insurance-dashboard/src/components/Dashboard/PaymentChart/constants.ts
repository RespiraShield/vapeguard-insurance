export const CHART_CONFIG = {
  COLUMN_WIDTH_RATIO: 0.6,
  COLOR: '#667eea',
  COLUMN_STYLE: {
    radius: [4, 4, 0, 0],
  },
  LABEL_POSITION: 'top' as const,
  LABEL_FONT_SIZE: 12,
  LABEL_COLOR: '#6b7280',
  AXIS_FONT_SIZE: 12,
  AXIS_COLOR: '#6b7280',
} as const;

export const MESSAGES = {
  NO_DATA_TITLE: 'No Payments Available',
  NO_DATA_MESSAGE: 'Payment history will appear here once you make your first payment',
  AMOUNT_ALIAS: 'Payment Amount (₹)',
  MONTH_ALIAS: 'Month',
} as const;
