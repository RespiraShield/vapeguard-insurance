const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Global test utilities
global.testUtils = {
  // Helper to create valid personal details
  createValidPersonalDetails: () => ({
    name: 'John Doe',
    dob: '1990-01-01',
    city: 'mumbai'
  }),

  // Helper to create valid payment details
  createValidPaymentDetails: (method = 'upi') => {
    const baseDetails = { paymentMethod: method };
    
    switch (method) {
      case 'upi':
        return { ...baseDetails, upiId: 'john@paytm' };
      case 'netbanking':
        return { 
          ...baseDetails, 
          selectedBank: 'sbi', 
          accountNumber: '123456789012' 
        };
      case 'razorpay':
        return {
          ...baseDetails,
          cardNumber: '4111111111111111',
          expiryDate: '12/25',
          cvv: '123',
          cardholderName: 'John Doe'
        };
      default:
        return baseDetails;
    }
  },

  // Helper to create mock file
  createMockFile: () => ({
    fieldname: 'billPhoto',
    originalname: 'test-bill.jpg',
    mimetype: 'image/jpeg',
    size: 1024 * 1024, // 1MB
    filename: 'test-bill-123.jpg',
    path: 'uploads/bills/test-bill-123.jpg'
  })
};
