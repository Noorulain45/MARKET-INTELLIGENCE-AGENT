import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/market-intelligence';

  // --- DEBUG ---
  console.log('[DB] NODE_ENV       :', process.env.NODE_ENV);
  console.log('[DB] MONGODB_URI    :', uri ? uri.replace(/:([^@]+)@/, ':****@') : '(not set — using localhost fallback)');
  console.log('[DB] URI protocol   :', uri.startsWith('mongodb+srv') ? 'mongodb+srv (Atlas ✅)' : uri.startsWith('mongodb://') ? 'mongodb:// (plain — ⚠️  Atlas needs mongodb+srv)' : '(unknown)');
  // --- END DEBUG ---

  mongoose.set('strictQuery', true);

  try {
    console.log('[DB] Attempting mongoose.connect()...');
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('[DB] mongoose.connect() resolved — connection state:', mongoose.connection.readyState);
  } catch (err: any) {
    console.error('[DB] mongoose.connect() FAILED');
    console.error('[DB] Error name    :', err?.name);
    console.error('[DB] Error message :', err?.message);
    if (err?.reason) {
      console.error('[DB] Topology reason:', JSON.stringify(err.reason, null, 2));
    }
    throw err; // re-throw so server.ts can handle it
  }

  mongoose.connection.on('error', (err) => {
    console.error('[DB] Runtime connection error:', err.message);
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] Disconnected from MongoDB');
    logger.warn('MongoDB disconnected. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[DB] Reconnected to MongoDB');
    logger.info('MongoDB reconnected');
  });
}
