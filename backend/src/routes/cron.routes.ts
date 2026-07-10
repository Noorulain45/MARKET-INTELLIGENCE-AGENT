import { Router, Request, Response, NextFunction } from 'express';
import {
  runNewsCollection,
  runTrendCollection,
  runSentimentCollection,
  runAIInsights,
} from '../jobs/scheduler';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Middleware to verify the request is coming from Vercel Cron.
 * Vercel sends the CRON_SECRET as a Bearer token in the Authorization header.
 */
function verifyCronSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // No secret configured — only allow in development
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ success: false, message: 'CRON_SECRET not configured' });
      return;
    }
    return next();
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${secret}`) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  next();
}

// POST /api/v1/cron/news  — runs every 2 hours
router.post('/news', verifyCronSecret, async (_req: Request, res: Response) => {
  try {
    const result = await runNewsCollection();
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error('Cron /news error:', err);
    res.status(500).json({ success: false, message: 'News collection failed' });
  }
});

// POST /api/v1/cron/trends  — runs every 6 hours
router.post('/trends', verifyCronSecret, async (_req: Request, res: Response) => {
  try {
    const result = await runTrendCollection();
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error('Cron /trends error:', err);
    res.status(500).json({ success: false, message: 'Trend collection failed' });
  }
});

// POST /api/v1/cron/sentiment  — runs daily at 3 AM
router.post('/sentiment', verifyCronSecret, async (_req: Request, res: Response) => {
  try {
    const result = await runSentimentCollection();
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error('Cron /sentiment error:', err);
    res.status(500).json({ success: false, message: 'Sentiment collection failed' });
  }
});

// POST /api/v1/cron/insights  — runs every 12 hours
router.post('/insights', verifyCronSecret, async (_req: Request, res: Response) => {
  try {
    const result = await runAIInsights();
    res.json({ success: true, ...result });
  } catch (err) {
    logger.error('Cron /insights error:', err);
    res.status(500).json({ success: false, message: 'AI insights failed' });
  }
});

export default router;
