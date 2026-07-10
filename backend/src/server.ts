import 'dotenv/config';
import app from './app';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    try {
      await connectDB();
      logger.info('✅ MongoDB connected');
    } catch (err) {
      logger.error('❌ MongoDB connection failed. Is MongoDB running on your machine?');
      logger.error('   Start it with: mongod  (or install from https://www.mongodb.com/try/download/community)');
      logger.error('   Or set MONGODB_URI in .env to a remote MongoDB URI (e.g. MongoDB Atlas)');
      logger.error('   Server will exit. Fix MongoDB and restart.');
      process.exit(1);
    }

    // Connect to Redis (optional — gracefully skipped if REDIS_URL not set)
    try {
      await connectRedis();
    } catch (err) {
      logger.warn('⚠️  Redis connection failed — caching will be unavailable.');
      logger.warn('   Continuing without Redis...');
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();
