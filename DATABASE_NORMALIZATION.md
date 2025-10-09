# Database Normalization for VapeGuard Insurance Portal

## Overview
The original database structure stored all application data in a single `Application` model with nested objects. This has been normalized into separate, related collections for better data organization, query performance, and maintainability.

## Normalized Database Schema

### 1. **Users Collection**
- **Purpose**: Store user personal information
- **Fields**: name, email, phone, dateOfBirth, city, age, metadata
- **Indexes**: email, phone, createdAt
- **Relationships**: One-to-many with Applications

### 2. **Insurance Plans Collection**
- **Purpose**: Store insurance plan details and pricing
- **Fields**: planId, name, description, price, features, category, isActive
- **Indexes**: planId, isActive, sortOrder
- **Relationships**: One-to-many with Applications and Payments

### 3. **Applications Collection** (Normalized)
- **Purpose**: Store application status and references
- **Fields**: userId, insurancePlanId, applicationNumber, status, timestamps
- **Indexes**: applicationNumber, userId, insurancePlanId, status
- **Relationships**: 
  - Many-to-one with Users
  - Many-to-one with Insurance Plans
  - One-to-one with Verification, Payment, BillPhoto

### 4. **Verifications Collection**
- **Purpose**: Store OTP verification status for email and phone
- **Fields**: userId, applicationId, email{}, phone{}, isComplete
- **Indexes**: userId, applicationId, verification status
- **Methods**: generateOTP(), verifyOTP() for both email and phone

### 5. **Payments Collection**
- **Purpose**: Store payment transactions and status
- **Fields**: userId, applicationId, insurancePlanId, amount, paymentMethod, transactionDetails, status
- **Indexes**: userId, applicationId, transactionId, status
- **Methods**: markCompleted(), markFailed(), initiateRefund()

### 6. **Bill Photos Collection**
- **Purpose**: Store uploaded bill photo metadata
- **Fields**: userId, applicationId, filename, path, size, mimetype, verification status
- **Indexes**: userId, applicationId, status
- **Methods**: markVerified(), markRejected()

## Benefits of Normalization

### 1. **Data Integrity**
- Eliminates data duplication
- Ensures referential integrity through foreign keys
- Prevents inconsistent data states

### 2. **Query Performance**
- Targeted indexes on specific collections
- Faster queries for specific data types
- Better aggregation capabilities

### 3. **Scalability**
- Individual collections can be optimized separately
- Easier to implement caching strategies
- Better horizontal scaling options

### 4. **Maintainability**
- Clear separation of concerns
- Easier to modify specific data structures
- Better code organization with dedicated handlers

### 5. **Security**
- Granular access control per collection
- Sensitive data isolation
- Better audit trails

## API Handler Updates

### New Handler Structure:
- `normalizedApplicationHandler.js` - Application CRUD operations
- `normalizedVerificationHandler.js` - OTP verification logic
- `normalizedPaymentHandler.js` - Payment processing
- `normalizedRoutes.js` - Unified routing

### Key Improvements:
- **Population**: Automatic relationship loading with `.populate()`
- **Transactions**: Better support for atomic operations
- **Validation**: Model-specific validation rules
- **Error Handling**: More granular error responses

## Migration Strategy

### 1. **Data Migration Script**
- Automated migration from old to new schema
- Preserves all existing data relationships
- Creates backup before migration
- Provides detailed migration statistics

### 2. **Backward Compatibility**
- Old API endpoints remain functional during transition
- Gradual migration approach possible
- Rollback capability if needed

### 3. **Testing Strategy**
- Unit tests for each model
- Integration tests for API handlers
- Performance benchmarks
- Data integrity validation

## Implementation Status

✅ **Completed:**
- All normalized models created
- API handlers updated
- Migration script prepared
- Route definitions updated

🔄 **Next Steps:**
- Run migration script
- Update frontend API calls (if needed)
- Performance testing
- Production deployment

## Usage Examples

### Creating a New Application:
```javascript
// 1. Create/find user
const user = await User.findOneAndUpdate({email}, userData, {upsert: true});

// 2. Create application
const application = new Application({userId: user._id});

// 3. Create verification record
const verification = new Verification({userId: user._id, applicationId: application._id});
```

### Querying with Relationships:
```javascript
// Get full application details
const application = await Application.findById(id)
  .populate('userId')
  .populate('insurancePlanId')
  .populate('verification')
  .populate('payment')
  .populate('billPhoto');
```

This normalized structure provides a solid foundation for the VapeGuard Insurance Portal with improved performance, maintainability, and scalability.
