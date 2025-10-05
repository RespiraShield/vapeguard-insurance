// Feature flags configuration for VapeGuard Insurance Portal
// All feature flags are controlled via environment variables

// Helper function to parse boolean environment variables
const parseEnvBoolean = (envVar, defaultValue = false) => {
  if (envVar === undefined || envVar === null) return defaultValue;
  return envVar.toLowerCase() === 'true' || envVar === '1';
};

// Feature flags object populated from environment variables
const featureFlags = {
  // Payment feature flag - controlled by REACT_APP_PAYMENT_ENABLED
  PAYMENT_ENABLED: parseEnvBoolean(process.env.REACT_APP_PAYMENT_ENABLED, false),
  
  // Bill photo upload feature flag - controlled by REACT_APP_BILL_PHOTO_ENABLED
  BILL_PHOTO_ENABLED: parseEnvBoolean(process.env.REACT_APP_BILL_PHOTO_ENABLED, false)
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (featureName) => {
  return featureFlags[featureName] === true;
};

// Helper function to get all feature flags
export const getAllFeatureFlags = () => {
  return { ...featureFlags };
};

// Helper function to get feature flag value with fallback
export const getFeatureFlag = (featureName, defaultValue = false) => {
  return featureFlags[featureName] !== undefined ? featureFlags[featureName] : defaultValue;
};

// Feature flags configuration loaded

export default featureFlags;
