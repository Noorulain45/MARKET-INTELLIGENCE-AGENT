import cron from 'node-cron';
import { collectAllNews } from '../services/collectors/newsCollector';
import { collectAllTrends } from '../services/collectors/trendCollector';
import { collectAllSentiment } from '../services/collectors/sentimentCollector';
import { managerAgent } from '../services/ai/agents/managerAgent';
import { logger } from '../utils/logger';
import { emitToDashboard } from '../config/socket';

export function startScheduledJobs(): void {
  // Collect news every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    logger.info('Cron: Starting news collection');
    try {
      await collectAllNews();
      emitToDashboard('data:news:updated', { timestamp: new Date() });
    } catch (err) {
      logger.error('Cron news collection error:', err);
    }
  });

  // Collect trends every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    logger.info('Cron: Starting trend collection');
    try {
      await collectAllTrends();
      emitToDashboard('data:trends:updated', { timestamp: new Date() });
    } catch (err) {
      logger.error('Cron trends collection error:', err);
    }
  });

  // Collect sentiment daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    logger.info('Cron: Starting sentiment collection');
    try {
      await collectAllSentiment();
      emitToDashboard('data:sentiment:updated', { timestamp: new Date() });
    } catch (err) {
      logger.error('Cron sentiment collection error:', err);
    }
  });

  // Generate AI insights every 12 hours
  cron.schedule('0 */12 * * *', async () => {
    logger.info('Cron: Generating AI insights');
    try {
      const result = await managerAgent({ type: 'full' });
      emitToDashboard('data:insights:updated', {
        insights: result.finalInsight,
        timestamp: new Date(),
      });
    } catch (err) {
      logger.error('Cron AI insights error:', err);
    }
  });

  // Run initial collection on startup (with delay to avoid startup race conditions)
  setTimeout(async () => {
    try {
      logger.info('Running initial data collection...');
      await collectAllTrends();
    } catch (err) {
      logger.warn('Initial collection warning:', err);
    }
  }, 5000);

  logger.info('✅ All cron jobs scheduled');
}
