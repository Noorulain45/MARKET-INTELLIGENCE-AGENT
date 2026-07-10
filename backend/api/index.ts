import 'dotenv/config';
import app from '../src/app';
import { connectDB } from '../src/config/database';
import { connectRedis } from '../src/config/redis';
import { logger } from '../src/utils/logger';

// Vercel serverless: connections are cached across warm invocations
let isReady = false;

async function bootstrap() {
  if (isReady) return;

  await connectDB();
  logger.info('✅ MongoDB connected');

  try {
    await connectRedis();
  } catch {
    logger.warn('⚠️  Redis unavailable — continuing without cache');
  }

  isReady = true;
}

// Bootstrap on first cold start, then handle every request with Express
export default async function handler(req: any, res: any) {
  await bootstrap();
  return app(req, res);
}
