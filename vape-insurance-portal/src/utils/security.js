/**
 * Frontend Security Utilities
 * Provides input sanitization and validation functions
 */

// HTML entity encoding to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate Indian phone number
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Validate name (only letters and spaces)
export const validateName = (name) => {
  const nameRegex = /^[a-zA-Z\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

// Validate UPI ID
export const validateUPI = (upiId) => {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(upiId);
};

// Sanitize file upload
export const validateFileUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!file) return { valid: false, error: 'No file selected' };
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only image files (JPEG, PNG, GIF) are allowed' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true };
};

// Remove potentially dangerous characters from input
export const cleanInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove script tags, javascript:, data:, and other potentially dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Validate date of birth
export const validateDOB = (dob) => {
  const date = new Date(dob);
  const today = new Date();
  const minAge = 18;
  const maxAge = 100;
  
  if (isNaN(date.getTime())) return false;
  
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};

// Content Security Policy headers (for reference)
export const CSP_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com;"
};
