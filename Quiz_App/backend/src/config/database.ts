import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async (): Promise<void> => {
  try {
    // Support multiple env var names for flexibility across environments
    const mongoURI =
      process.env.MONGODB_URI ||
      process.env.MONGODB_URI_ATLAS ||
      process.env.MONGODB_URI_PROD;
    
    let memoryServer: MongoMemoryServer | null = null;

    let effectiveUri = mongoURI;
    if (!effectiveUri) {
      // Spin up in-memory MongoDB for development/testing when no URI is provided
      memoryServer = await MongoMemoryServer.create();
      effectiveUri = memoryServer.getUri();
      console.log('🧪 Using in-memory MongoDB instance');
    }

    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    try {
      await mongoose.connect(effectiveUri, options);
    } catch (primaryErr) {
      // If configured URI failed and we're in development, fallback to in-memory
      if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Primary MongoDB connection failed. Falling back to in-memory MongoDB for development.');
        if (!memoryServer) {
          memoryServer = await MongoMemoryServer.create();
          effectiveUri = memoryServer.getUri();
        }
        await mongoose.connect(effectiveUri, options);
      } else {
        throw primaryErr;
      }
    }

    console.log('✅ MongoDB connected successfully');
    
    // Handle connection events
    mongoose.connection.on('connected', () => {
      console.log('🎯 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🔄 MongoDB connection closed through app termination');
        if (memoryServer) {
          await memoryServer.stop();
          console.log('🛑 In-memory MongoDB stopped');
        }
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB connection closure:', err);
        process.exit(1);
      }
    });

  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
