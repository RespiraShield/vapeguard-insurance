// Utility functions for masking sensitive data (PII)

/**
 * Mask email address
 * @param {string} email - Email to mask
 * @returns {string} - Masked email
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }
  
  const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
  return `${maskedLocal}@${domain}`;
};

/**
 * Mask phone number
 * @param {string} phone - Phone number to mask
 * @returns {string} - Masked phone number
 */
const maskPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 4) return phone;
  
  // Show first 2 and last 2 digits, mask the rest
  const masked = digits.substring(0, 2) + '*'.repeat(digits.length - 4) + digits.substring(digits.length - 2);
  
  // Preserve original formatting if it was formatted
  if (phone.includes('-') || phone.includes(' ') || phone.includes('(')) {
    return `+91 ${masked.substring(0, 2)} ****-**${masked.substring(masked.length - 2)}`;
  }
  
  return masked;
};

/**
 * Mask PAN number
 * @param {string} pan - PAN number to mask
 * @returns {string} - Masked PAN number
 */
const maskPAN = (pan) => {
  if (!pan || typeof pan !== 'string') return '';
  
  const cleanPan = pan.toUpperCase().replace(/\s/g, '');
  
  if (cleanPan.length !== 10) return pan;
  
  // Show first 3 and last 1 characters, mask middle 6
  return cleanPan.substring(0, 3) + '******' + cleanPan.substring(9);
};

/**
 * Mask Aadhaar number
 * @param {string} aadhaar - Aadhaar number to mask
 * @returns {string} - Masked Aadhaar number
 */
const maskAadhaar = (aadhaar) => {
  if (!aadhaar || typeof aadhaar !== 'string') return '';
  
  const digits = aadhaar.replace(/\D/g, '');
  
  if (digits.length !== 12) return aadhaar;
  
  // Show last 4 digits only, mask first 8
  return '****-****-' + digits.substring(8);
};

/**
 * Mask bank account number
 * @param {string} accountNumber - Bank account number to mask
 * @returns {string} - Masked account number
 */
const maskBankAccount = (accountNumber) => {
  if (!accountNumber || typeof accountNumber !== 'string') return '';
  
  const digits = accountNumber.replace(/\D/g, '');
  
  if (digits.length < 4) return accountNumber;
  
  // Show last 4 digits only, mask the rest
  return '*'.repeat(digits.length - 4) + digits.substring(digits.length - 4);
};

module.exports = {
  maskEmail,
  maskPhone,
  maskPAN,
  maskAadhaar,
  maskBankAccount
};
