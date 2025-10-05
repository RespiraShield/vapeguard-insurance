const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try to connect to the main MongoDB first
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📦 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Main MongoDB connection failed:', error.message);
    
    // For development, try to use MongoDB memory server
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('🔄 Attempting to use MongoDB Memory Server for development...');
        
        // Dynamically import MongoDB memory server
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        const conn = await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        
        console.log(`📦 MongoDB Memory Server Connected: ${conn.connection.host}`);
        console.log('⚠️  Note: This is a temporary in-memory database for development');
        console.log('⚠️  Data will be lost when the server restarts');
        
        // Store the server instance for cleanup
        global.mongoMemoryServer = mongoServer;
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB Memory Server connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('📦 MongoDB Memory Server disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
          await mongoose.connection.close();
          if (global.mongoMemoryServer) {
            await global.mongoMemoryServer.stop();
            console.log('📦 MongoDB Memory Server stopped');
          }
          console.log('📦 MongoDB connection closed through app termination');
          process.exit(0);
        });
        
      } catch (memoryError) {
        console.error('❌ MongoDB Memory Server also failed:', memoryError.message);
        console.error('❌ Please ensure MongoDB is running or install a compatible version');
        process.exit(1);
      }
    } else {
      console.error('❌ Production environment requires MongoDB connection');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
