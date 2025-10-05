/**
 * Static text constants for VapeGuard Insurance Portal components
 */

// PaymentStep Constants
export const PAYMENT_STEP = {
  TITLE: 'Choose Payment Method',
  SUBTITLE: 'Select your preferred payment method to complete the transaction',
  CATEGORY_TITLE: 'UPI & Digital Wallets (Recommended)',
  UPI_DETAILS_TITLE: 'UPI Details',
  UPI_LABEL: 'UPI ID *',
  UPI_PLACEHOLDER: 'yourname@paytm / yourname@phonepe',
  PAYMENT_PROCESS_TITLE: 'Payment Process',
  PAYMENT_PROCESS_DESCRIPTION: (method) => `You'll be redirected to a secure payment gateway to complete your ${method.toUpperCase()} payment.`,
  METHODS: {
    UPI: {
      NAME: 'UPI',
      DESCRIPTION: 'Pay using any UPI app'
    },
    NET_BANKING: {
      NAME: 'Net Banking',
      DESCRIPTION: 'All major banks'
    },
    WALLET: {
      NAME: 'Digital Wallet',
      DESCRIPTION: 'PhonePe, GPay, Paytm'
    }
  },
  UPI_FORM: {
    LABEL: 'Enter UPI ID',
    PLACEHOLDER: 'yourname@paytm / yourname@phonepe',
    HINT: 'Enter your UPI ID to proceed with payment'
  },
  PROCESSING_INFO: {
    TITLE: 'Payment Processing',
    DESCRIPTION: 'You will be redirected to a secure payment gateway to complete your transaction.'
  },
  PAYMENT_METHODS: {
    UPI: {
      name: 'UPI',
      description: 'Any UPI App'
    },
    PHONEPE: {
      name: 'PhonePe',
      description: 'Wallet'
    },
    GPAY: {
      name: 'Google Pay',
      description: 'Wallet'
    },
    PAYTM: {
      name: 'Paytm',
      description: 'Wallet'
    }
  }
};

// InsuranceSelectionStep Constants
export const INSURANCE_SELECTION_STEP = {
  TITLE: 'Select Insurance Plan',
  SUBTITLE: 'Choose the insurance plan that best fits your needs',
  FEATURES_LABEL: 'Features:',
  SELECTED_BUTTON_TEXT: 'Selected',
  POPULAR_BADGE: 'POPULAR',
  PLANS: {
    BASIC: {
      NAME: 'Basic Plan',
      PRICE: '₹149/month',
      FEATURES: ['Basic coverage', 'Emergency support', 'Online consultation']
    },
    PREMIUM: {
      NAME: 'Premium Plan',
      PRICE: '₹299/month',
      FEATURES: ['Extended coverage', '24/7 support', 'Specialist consultation', 'Health checkups']
    },
    COMPLETE: {
      NAME: 'Complete Plan',
      PRICE: '₹499/month',
      FEATURES: ['Comprehensive coverage', 'Priority support', 'All consultations', 'Annual health package', 'Family coverage']
    }
  }
};

// SuccessStep Constants
export const SUCCESS_STEP = {
  TITLE: 'Application Submitted Successfully!',
  SUBTITLE: 'Your insurance application has been received and is being processed',
  APPLICATION_DETAILS_TITLE: 'Application Details',
  APPLICATION_ID_LABEL: 'Application ID:',
  STATUS_LABEL: 'Status:',
  STATUS_VALUE: 'Under Review',
  PROCESSING_TIME_LABEL: 'Expected Processing Time:',
  PROCESSING_TIME_VALUE: '2-3 business days',
  NEXT_STEPS_TITLE: "What's Next?",
  NEXT_STEPS: [
    'You will receive a confirmation email shortly',
    'Our team will review your application within 2-3 business days',
    "You'll be notified via email once your application is approved",
    'Keep your application ID for future reference'
  ]
};

// PersonalDetailsStep Constants
export const PERSONAL_DETAILS_STEP = {
  TITLE: 'Personal Details',
  SUBTITLE: 'Please provide your personal information',
  FORM: {
    NAME: {
      LABEL: 'Full Name *',
      PLACEHOLDER: 'Enter your full name'
    },
    EMAIL: {
      LABEL: 'Email Address *',
      PLACEHOLDER: 'Enter your email address'
    },
    PHONE: {
      LABEL: 'Phone Number *',
      PLACEHOLDER: 'Enter your 10-digit phone number'
    },
    DOB: {
      LABEL: 'Date of Birth *',
      PLACEHOLDER: 'Select your date of birth'
    },
    CITY: {
      LABEL: 'City *',
      PLACEHOLDER: 'Select your city',
      OPTIONS: [
        'Mumbai',
        'Delhi',
        'Bangalore',
        'Hyderabad',
        'Chennai',
        'Kolkata',
        'Pune',
        'Ahmedabad',
        'Jaipur',
        'Surat',
        'Lucknow',
        'Kanpur',
        'Nagpur',
        'Visakhapatnam',
        'Indore',
        'Thane',
        'Bhopal',
        'Patna',
        'Vadodara',
        'Ghaziabad'
      ]
    },
    BILL_PHOTO: {
      LABEL: 'Upload Bill Photo *',
      PLACEHOLDER: 'Click or drag file to this area to upload',
      HINT: 'Support for a single upload. Only image files (JPEG, PNG, GIF) up to 10MB.',
      UPLOAD_TEXT: 'Click or drag file to this area to upload',
      UPLOAD_HINT: 'Support for a single upload. Only image files (JPEG, PNG, GIF) up to 10MB.'
    }
  },
  FIELDS: {
    NAME: {
      label: 'Full Name *',
      placeholder: 'Enter your full name'
    },
    EMAIL: {
      label: 'Email Address *',
      placeholder: 'Enter your email address'
    },
    PHONE: {
      label: 'Phone Number *',
      placeholder: 'Enter your 10-digit phone number'
    },
    DOB: {
      label: 'Date of Birth *',
      placeholder: 'Select your date of birth'
    },
    CITY: {
      label: 'City *',
      placeholder: 'Select your city'
    },
    BILL_PHOTO: {
      label: 'Upload Bill Photo *',
      placeholder: 'Click or drag file to this area to upload',
      hint: 'Support for a single upload. Only image files (JPEG, PNG, GIF) up to 10MB.'
    }
  },
  BUTTONS: {
    SEND_EMAIL_OTP: 'Send Email OTP',
    SEND_PHONE_OTP: 'Send Phone OTP',
    VERIFY_EMAIL_OTP: 'Verify Email OTP',
    VERIFY_PHONE_OTP: 'Verify Phone OTP',
    RESEND_OTP: 'Resend OTP'
  },
  OTP_VERIFICATION: {
    EMAIL_BUTTON: 'Send Email OTP',
    PHONE_BUTTON: 'Send Phone OTP',
    EMAIL_PLACEHOLDER: 'Enter email OTP',
    PHONE_PLACEHOLDER: 'Enter phone OTP',
    VERIFY_BUTTON: 'Verify OTP',
    RESEND_BUTTON: 'Resend OTP'
  },
  CITIES: [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Surat',
    'Lucknow',
    'Kanpur',
    'Nagpur',
    'Visakhapatnam',
    'Indore',
    'Thane',
    'Bhopal',
    'Patna',
    'Vadodara',
    'Ghaziabad'
  ]
};

// Common Constants
export const COMMON = {
  LOADING: 'Loading...',
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  FILE_UPLOAD_ERROR: 'File upload failed',
  NETWORK_ERROR: 'Network error occurred',
  SUCCESS: 'Success',
  ERROR: 'Error',
  WARNING: 'Warning',
  INFO: 'Information'
};
