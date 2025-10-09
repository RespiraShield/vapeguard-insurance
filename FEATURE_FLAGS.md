# 🚩 Feature Flags Configuration Guide

This document explains how to use environment-based feature flags in the VapeGuard Insurance Portal.

## 📋 Overview

Feature flags are controlled via environment variables in the `.env` file. Currently, only the payment step is controlled by feature flags - all other steps (Personal Details, Insurance Selection, etc.) are always available.

This approach provides:

- ✅ **Environment-specific configurations** (development, staging, production)
- ✅ **Easy deployment control** without code changes
- ✅ **Runtime feature toggling** for A/B testing
- ✅ **Rollback capabilities** for quick feature disabling

## 🔧 Configuration

### Frontend Environment Variables

The payment feature flag must be prefixed with `REACT_APP_` to be accessible in React:

```bash
# Feature Flags
REACT_APP_PAYMENT_ENABLED=false              # Enable/disable payment step
```

### Supported Values

Feature flags accept the following values:
- `true`, `TRUE`, `1` → Feature enabled
- `false`, `FALSE`, `0` → Feature disabled
- Empty or undefined → Uses default value

## 🎯 Available Feature Flags

### `REACT_APP_PAYMENT_ENABLED`
**Default:** `false`
**Description:** Controls whether the payment step is shown in the application flow.

- `true`: Shows normal payment step (Step 3)
- `false`: Shows "Enroll Now, Pay Later" step instead

**Usage Example:**
```bash
# Disable payment for beta testing
REACT_APP_PAYMENT_ENABLED=false

# Enable payment for production
REACT_APP_PAYMENT_ENABLED=true
```

## 🔒 Always Available Features

The following features are always enabled and do not have feature flags:

- ✅ **Personal Details Step** - Always available
- ✅ **Insurance Selection Step** - Always available  
- ✅ **Email Verification** - Always required
- ✅ **File Upload** - Always available
- ✅ **Application Tracking** - Always available

## 🚀 Usage in Code

### Checking Feature Flags

```javascript
import { isFeatureEnabled } from '../config/featureFlags';

// Check if a feature is enabled
if (isFeatureEnabled('PAYMENT_ENABLED')) {
  // Show payment step
} else {
  // Show enrollment step
}
```

### Getting Feature Flag Values

```javascript
import { getFeatureFlag } from '../config/featureFlags';

// Get feature flag with fallback
const debugMode = getFeatureFlag('DEBUG_MODE', false);
```

### Getting All Feature Flags

```javascript
import { getAllFeatureFlags } from '../config/featureFlags';

// Get all feature flags (useful for debugging)
const allFlags = getAllFeatureFlags();
console.log('Feature Flags:', allFlags);
```

## 🔄 Deployment Scenarios

### Development Environment
```bash
REACT_APP_PAYMENT_ENABLED=false
REACT_APP_DEBUG_MODE=true
REACT_APP_MOCK_PAYMENT=true
```

### Staging Environment
```bash
REACT_APP_PAYMENT_ENABLED=true
REACT_APP_DEBUG_MODE=true
REACT_APP_MOCK_PAYMENT=false
```

### Production Environment
```bash
REACT_APP_PAYMENT_ENABLED=true
REACT_APP_DEBUG_MODE=false
REACT_APP_MOCK_PAYMENT=false
```

## 🛠️ Implementation Details

### Feature Flag Parser

The `parseEnvBoolean()` function handles environment variable parsing:

```javascript
const parseEnvBoolean = (envVar, defaultValue = false) => {
  if (envVar === undefined || envVar === null) return defaultValue;
  return envVar.toLowerCase() === 'true' || envVar === '1';
};
```

### Runtime Logging

In development mode, feature flags are logged to the console:

```
🚩 Feature Flags Configuration: {
  PAYMENT_ENABLED: false,
  EMAIL_VERIFICATION_ENABLED: true,
  PHONE_VERIFICATION_ENABLED: true,
  FILE_UPLOAD_ENABLED: true,
  DEBUG_MODE: true,
  MOCK_PAYMENT: true
}
```

## 📝 Best Practices

1. **Always use environment variables** for feature flags
2. **Provide sensible defaults** for all flags
3. **Document flag purposes** and expected values
4. **Test both enabled and disabled states** in development
5. **Use descriptive flag names** that clearly indicate their purpose
6. **Log flag states** in development for debugging

## 🔧 Adding New Feature Flags

1. **Add to environment files:**
   ```bash
   # .env and .env.example
   REACT_APP_NEW_FEATURE_ENABLED=false
   ```

2. **Update featureFlags.js:**
   ```javascript
   const featureFlags = {
     // ... existing flags
     NEW_FEATURE_ENABLED: parseEnvBoolean(process.env.REACT_APP_NEW_FEATURE_ENABLED, false),
   };
   ```

3. **Use in components:**
   ```javascript
   if (isFeatureEnabled('NEW_FEATURE_ENABLED')) {
     // New feature code
   }
   ```

## 🚨 Important Notes

- **Restart required:** Changes to `.env` files require a server restart
- **Build time:** Feature flags are evaluated at build time in production
- **Security:** Never put sensitive data in environment variables
- **Naming:** Always prefix React environment variables with `REACT_APP_`

---

*This approach provides maximum flexibility for feature management while maintaining clean, maintainable code.*
