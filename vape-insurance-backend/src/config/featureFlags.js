// Feature flags configuration for VapeGuard Insurance Backend
// All feature flags are controlled via environment variables

// Helper function to parse boolean environment variables
const parseEnvBoolean = (envVar, defaultValue = false) => {
  if (envVar === undefined || envVar === null) return defaultValue;
  return envVar.toLowerCase() === 'true' || envVar === '1';
};

// Feature flags object populated from environment variables
const featureFlags = {
  // Payment feature flag - controlled by PAYMENT_ENABLED
  PAYMENT_ENABLED: parseEnvBoolean(process.env.PAYMENT_ENABLED, false),
  
  // Bill photo upload feature flag - controlled by BILL_PHOTO_ENABLED
  BILL_PHOTO_ENABLED: parseEnvBoolean(process.env.BILL_PHOTO_ENABLED, false)
};

// Helper function to check if a feature is enabled
const isFeatureEnabled = (featureName) => {
  return featureFlags[featureName] === true;
};

// Helper function to get all feature flags
const getAllFeatureFlags = () => {
  return { ...featureFlags };
};

// Helper function to get feature flag value with fallback
const getFeatureFlag = (featureName, defaultValue = false) => {
  return featureFlags[featureName] !== undefined ? featureFlags[featureName] : defaultValue;
};

// Log feature flags in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🚩 Backend Feature Flags Configuration:', featureFlags);
}

module.exports = {
  featureFlags,
  isFeatureEnabled,
  getAllFeatureFlags,
  getFeatureFlag
};
