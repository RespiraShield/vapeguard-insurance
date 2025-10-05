# VapeGuard Insurance Backend API

A comprehensive Node.js Express backend for the VapeGuard Insurance Portal, providing secure and scalable API endpoints for insurance application processing.

## 🚀 Features

- **Multi-step Application Process**: Personal details, insurance selection, payment processing
- **File Upload Support**: Secure bill photo upload with validation
- **Payment Integration**: Razorpay integration with multiple payment methods
- **Data Validation**: Comprehensive input validation using Joi
- **Error Handling**: Robust error handling and logging
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Database**: MongoDB with Mongoose ODM
- **File Management**: Multer for file uploads with size and type validation

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js          # MongoDB connection configuration
│   └── upload.js            # Multer file upload configuration
├── middleware/
│   ├── errorHandler.js      # Global error handling middleware
│   ├── notFound.js          # 404 handler middleware
│   └── validation.js        # Input validation middleware
├── models/
│   └── Application.js       # Application data model
├── routes/
│   ├── application.js       # Application CRUD operations
│   ├── auth.js              # Authentication routes (future use)
│   ├── insurance.js         # Insurance plans and statistics
│   ├── payment.js           # Payment processing routes
│   └── upload.js            # File upload routes
├── validators/
│   └── applicationValidator.js # Joi validation schemas
└── server.js                # Main server file
```

## 🛠 Installation

1. **Clone and navigate to the backend directory:**
   ```bash
   cd vape-insurance-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/vape_insurance_db
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Payment Gateway (Razorpay)
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Email Service (SendGrid) - REQUIRED for OTP functionality
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=VapeGuard Insurance
   
   # Frontend
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB:**
   ```bash
   # Using MongoDB Community Edition
   brew services start mongodb/brew/mongodb-community
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## 📋 API Endpoints

### Health Check
- `GET /health` - Server health check

### Insurance Plans
- `GET /api/insurance/plans` - Get all insurance plans
- `GET /api/insurance/plans/:id` - Get specific plan by ID
- `GET /api/insurance/stats` - Get insurance statistics

### Application Management
- `POST /api/application/personal-details` - Create application with personal details
- `PUT /api/application/:id/insurance` - Update application with insurance selection
- `PUT /api/application/:id/payment` - Update application with payment details
- `POST /api/application/:id/submit` - Submit complete application
- `GET /api/application/:id` - Get application by ID
- `GET /api/application/number/:applicationNumber` - Get application by number

### File Upload
- `POST /api/upload/bill-photo/:applicationId` - Upload bill photo
- `GET /api/upload/bill-photo/:applicationId` - Get bill photo info
- `DELETE /api/upload/bill-photo/:applicationId` - Delete bill photo

### Payment Processing
- `POST /api/payment/create-order/:applicationId` - Create Razorpay order
- `POST /api/payment/verify/:applicationId` - Verify Razorpay payment
- `POST /api/payment/failure/:applicationId` - Handle payment failure
- `POST /api/payment/process/:applicationId` - Process non-Razorpay payments
- `GET /api/payment/status/:applicationId` - Get payment status

## 💳 Payment Methods Supported

1. **UPI**: Direct UPI ID validation and processing
2. **Net Banking**: Support for major Indian banks
3. **Cards**: Via Razorpay, Paytm, PhonePe, Google Pay
4. **Razorpay**: Integrated payment gateway

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: Joi schemas for all inputs
- **File Upload Security**: Type and size validation
- **Error Handling**: No sensitive data exposure

## 📊 Data Models

### Application Schema
```javascript
{
  personalDetails: {
    name: String,
    dateOfBirth: Date,
    city: String,
    age: Number
  },
  billPhoto: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  insuranceDetails: {
    selectedPlan: Number,
    planName: String,
    planPrice: String,
    planFeatures: [String]
  },
  paymentDetails: {
    method: String,
    // Payment-specific fields based on method
  },
  status: String, // draft, submitted, completed, etc.
  paymentStatus: String, // pending, completed, failed
  applicationNumber: String, // Auto-generated unique ID
  transactionDetails: {
    transactionId: String,
    amount: Number,
    paidAt: Date
  }
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Format code
npm run format
```

## 🚀 Deployment

1. **Production Environment Variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   PORT=5000
   ```

2. **Build and Start:**
   ```bash
   npm start
   ```

## 📈 Monitoring

- Health check endpoint: `GET /health`
- Application statistics: `GET /api/insurance/stats`
- Error logging to console (can be extended to external services)

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `RAZORPAY_KEY_ID`: Razorpay API key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key
- `FRONTEND_URL`: Frontend application URL for CORS

### File Upload Limits
- Maximum file size: 10MB
- Allowed types: JPEG, PNG, GIF
- Upload directory: `uploads/bills/`

## 🤝 Integration with Frontend

The backend is designed to work seamlessly with the React frontend:

1. **CORS configured** for frontend URL
2. **JSON responses** matching frontend expectations
3. **Error format** compatible with frontend error handling
4. **File upload** endpoints for bill photo functionality
5. **Payment flow** supporting all frontend payment methods

## 📝 License

MIT License - see LICENSE file for details.

## 👥 Support

For support and questions, please contact the VapeGuard development team.
