# 🔧 Backend Guide - VapeGuard Insurance Portal

> **For the Logic People!** This is the brain that processes everything 🧠

## 🌟 What is the Backend?

Think of the backend like the **kitchen of a restaurant**:
- It receives orders (API requests) from the frontend
- It processes the orders (validates data, saves to database)
- It sends back results (success/error responses)
- It keeps everything organized and secure

## 🏗️ Our Backend Structure

```
src/
├── 🚀 server.js            # The main entrance (starts everything)
├── 📊 config/              # Settings and configurations
│   ├── database.js         # Connects to MongoDB
│   └── upload.js           # Handles file uploads
├── 🎯 handlers/            # Business logic controllers (NEW!)
│   ├── applicationHandler.js  # Form processing logic
│   ├── uploadHandler.js       # File management logic
│   ├── paymentHandler.js      # Payment processing logic
│   └── insuranceHandler.js    # Plan management logic
├── 🛡️ middleware/          # Security guards and helpers
│   ├── errorHandler.js     # Catches and handles errors
│   ├── validation.js       # Checks if data is correct
│   └── notFound.js         # Handles missing pages
├── 📋 models/              # Database blueprints
│   └── Application.js      # What user applications look like
├── 🛣️ routes/              # Clean API route definitions
│   ├── application.js      # Routes that delegate to handlers
│   ├── upload.js           # Routes that delegate to handlers
│   ├── payment.js          # Routes that delegate to handlers
│   └── insurance.js        # Routes that delegate to handlers
├── ✅ validators/          # Data quality checkers
│   └── applicationValidator.js  # Rules for valid data
└── 🧪 tests/              # Makes sure everything works
    ├── models/             # Tests database models
    ├── routes/             # Tests API endpoints
    └── integration/        # Tests complete flows
```

## 🎯 Core Concepts (Building Blocks)

### 🚀 Server.js - The Command Center
**What it does**: Starts the entire backend and connects everything
```javascript
// Like turning on the lights in a building
const app = express();
app.use('/api/application', applicationRoutes);  // Connect the routes
app.listen(5000);  // Start listening for requests
```

**Key Features**:
- 🔐 Security (helmet, CORS, rate limiting)
- 📝 Logging (tracks what happens)
- 🛣️ Route setup (connects URLs to functions)
- 🗄️ Database connection

### 📊 Models - The Data Blueprint
**What it does**: Defines what user data looks like in the database
```javascript
// Like a form template
const applicationSchema = {
  personalDetails: {
    name: String,        // "John Doe"
    dateOfBirth: Date,   // 1990-01-01
    city: String,        // "mumbai"
    age: Number          // 34 (calculated automatically)
  },
  insuranceDetails: {
    selectedPlan: Number,  // 1, 2, or 3
    planName: String,      // "Basic Respiratory Care"
    planPrice: String      // "₹149/purchase"
  },
  paymentDetails: {
    method: String,        // "upi", "netbanking", "card"
    // ... other payment fields
  }
}
```

### 🎯 Handlers - The Business Logic Controllers (NEW!)
**What it does**: Contains all the actual business logic, separated from routes for clean code

#### Why Use Handlers?
- **🧹 Clean Separation**: Routes only define endpoints, handlers contain logic
- **🔄 Reusability**: Handlers can be used by multiple routes or other parts of the app
- **🧪 Easy Testing**: Test business logic independently from HTTP routing
- **📖 Better Readability**: Smaller, focused files that are easier to understand

#### Handler Structure:
```javascript
// Example: applicationHandler.js
const createPersonalDetails = async (req, res, next) => {
  try {
    // 1. Validate input data
    // 2. Process business logic
    // 3. Save to database
    // 4. Send response
  } catch (error) {
    next(error); // Let error middleware handle it
  }
};

module.exports = { createPersonalDetails };
```

### 🛣️ Routes - The Clean Traffic Directors
**What it does**: Define endpoints and delegate to handlers (much cleaner now!)

#### Application Routes (`/api/application/`)
```javascript
// Old way (messy):
router.post('/personal-details', async (req, res, next) => {
  // 50+ lines of business logic here...
});

// New way (clean):
router.post('/personal-details', createPersonalDetails);
```

#### Route Endpoints:
```javascript
POST /personal-details     → Save user's basic info
PUT /:id/insurance        → Save insurance plan choice
PUT /:id/payment          → Save payment details
POST /:id/submit          → Submit complete application
GET /:id                  → Get application details
```

#### Upload Routes (`/api/upload/`)
```javascript
POST /bill-photo/:id      → Upload bill photo
GET /bill-photo/:id       → Get photo info
DELETE /bill-photo/:id    → Delete photo
```

#### Payment Routes (`/api/payment/`)
```javascript
POST /create-order/:id    → Create payment order
POST /verify/:id          → Verify payment success
POST /process/:id         → Process payment
GET /status/:id           → Check payment status
```

## 🔄 Request Flow (How Things Happen)

```
1. Frontend sends request → Express receives it
2. Middleware checks → Is data valid? Is user allowed?
3. Route handler runs → Process the request
4. Database operation → Save/retrieve data
5. Send response back → Success or error message
```

### Example: Submitting Personal Details
```javascript
// 1. Frontend sends this:
POST /api/application/personal-details
{
  "name": "John Doe",
  "dob": "1990-01-01",
  "city": "mumbai"
}

// 2. Validation middleware checks:
✅ Name: At least 2 characters? ✅
✅ Age: Over 18? ✅
✅ City: Valid city? ✅

// 3. Route handler processes:
- Calculate age from date of birth
- Generate unique application number
- Save to database

// 4. Send response:
{
  "success": true,
  "data": {
    "applicationId": "507f1f77bcf86cd799439011",
    "applicationNumber": "VG1234567890"
  }
}
```

## 🗄️ Database (MongoDB) - The Memory

### What Gets Stored:
```javascript
{
  _id: "507f1f77bcf86cd799439011",           // Unique ID
  applicationNumber: "VG1234567890",          // Human-readable ID
  personalDetails: {
    name: "John Doe",
    dateOfBirth: "1990-01-01",
    city: "mumbai",
    age: 34
  },
  billPhoto: {
    filename: "bill-1234567890.jpg",
    originalName: "my-bill.jpg",
    size: 1024000,
    uploadedAt: "2024-01-01T10:00:00Z"
  },
  insuranceDetails: {
    selectedPlan: 1,
    planName: "Basic Respiratory Care",
    planPrice: "₹149/purchase"
  },
  status: "completed",                        // draft, submitted, completed
  paymentStatus: "completed",                 // pending, completed, failed
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-01T10:30:00Z"
}
```

## 🛡️ Security Features

### Input Validation
```javascript
// Joi schemas check everything
name: Joi.string().min(2).max(100).pattern(/^[a-zA-Z\s]+$/),
age: Joi.number().min(18).max(100),
upiId: Joi.string().pattern(/^[\w.-]+@[\w.-]+$/)
```

### File Upload Security
```javascript
// Only allow safe files
allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
maxSize: 10MB
scanForViruses: true (in production)
```

### Error Handling
```javascript
// Never expose sensitive information
if (error.name === 'ValidationError') {
  return res.status(400).json({
    success: false,
    error: "Please check your input data"
  });
}
```

## 💳 Payment Processing

### Razorpay Integration
```javascript
// 1. Create order
const order = await razorpay.orders.create({
  amount: 14900,  // ₹149 in paise
  currency: 'INR'
});

// 2. Verify payment
const isValid = crypto
  .createHmac('sha256', secret)
  .update(orderData)
  .digest('hex') === signature;

// 3. Update application status
if (isValid) {
  application.paymentStatus = 'completed';
  application.status = 'completed';
}
```

## 🧪 Testing Strategy

### Test Types:
1. **Unit Tests** - Test individual functions
2. **Integration Tests** - Test API endpoints
3. **End-to-End Tests** - Test complete user flows

### Example Test:
```javascript
test('should create application with valid personal details', async () => {
  const response = await request(app)
    .post('/api/application/personal-details')
    .send({
      name: 'John Doe',
      dob: '1990-01-01',
      city: 'mumbai'
    })
    .expect(201);

  expect(response.body.success).toBe(true);
  expect(response.body.data.applicationId).toBeDefined();
});
```

## 🔧 Environment Setup

### Required Environment Variables:
```bash
# .env file
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vape_insurance_db
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:3000
```

### Development Commands:
```bash
npm run dev            # Start with auto-restart
npm start              # Start production mode
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
```

## 🐛 Common Issues & Solutions

### Issue: "Database connection failed"
**Solution**:
1. Start MongoDB: `brew services start mongodb/brew/mongodb-community`
2. Check connection string in .env
3. Verify MongoDB is running on port 27017

### Issue: "File upload not working"
**Solution**:
1. Check uploads/ directory exists
2. Verify file size limits
3. Check multer configuration

### Issue: "Payment verification failed"
**Solution**:
1. Check Razorpay keys in .env
2. Verify webhook signatures
3. Check network connectivity

## 📊 API Documentation

### Response Format:
```javascript
// Success Response
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* actual data */ }
}

// Error Response
{
  "success": false,
  "error": "Error message",
  "details": [ /* validation errors */ ]
}
```

### Status Codes:
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `404` - Not found
- `500` - Server error

## 🎯 For New Developers

### Start Here:
1. **Look at server.js** - Understand how it starts
2. **Check Application.js model** - See data structure
3. **Look at one route file** - Understand request handling
4. **Run the tests** - See how everything works
5. **Make a small change** - Add a console.log

### Easy First Tasks:
- 📝 Add a new validation rule
- 🔄 Add a new API endpoint
- 🧪 Write a simple test
- 📊 Add logging to track requests

## 📚 Learning Path

1. **Node.js Basics** → How JavaScript runs on servers
2. **Express Framework** → How to handle web requests
3. **MongoDB** → How to store and retrieve data
4. **API Design** → How to create good endpoints
5. **Testing** → How to ensure code quality

## 🎉 Fun Facts

- 🚀 The server can handle **100+ requests per minute**
- 🔒 All passwords and sensitive data are **encrypted**
- 🧪 We have **80+ tests** covering everything
- 📊 Application numbers are **unique and trackable**
- 🔄 The API is **RESTful** and follows best practices

## 🔍 Debugging Tips

### Enable Debug Mode:
```bash
DEBUG=* npm run dev  # See all debug info
```

### Common Debug Commands:
```javascript
console.log('Request received:', req.body);
console.log('Database query result:', result);
console.log('Error occurred:', error.message);
```

### Log Files:
- Development: Console output
- Production: Log files in logs/ directory

---

*Remember: Backend is all about reliability and security! If data is safe and requests are fast, you're doing it right! 🔒*
