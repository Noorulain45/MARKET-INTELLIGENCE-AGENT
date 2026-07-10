import { collectAllNews } from '../services/collectors/newsCollector';
import { collectAllTrends } from '../services/collectors/trendCollector';
import { collectAllSentiment } from '../services/collectors/sentimentCollector';
import { managerAgent } from '../services/ai/agents/managerAgent';
import { logger } from '../utils/logger';

/**
 * These functions are called by the /api/v1/cron/* endpoints,
 * which Vercel Cron Jobs hits on a schedule defined in vercel.json.
 */

export async function runNewsCollection(): Promise<{ ok: boolean; message: string }> {
  logger.info('Cron: Starting news collection');
  await collectAllNews();
  logger.info('Cron: News collection complete');
  return { ok: true, message: 'News collection complete' };
}

export async function runTrendCollection(): Promise<{ ok: boolean; message: string }> {
  logger.info('Cron: Starting trend collection');
  await collectAllTrends();
  logger.info('Cron: Trend collection complete');
  return { ok: true, message: 'Trend collection complete' };
}

export async function runSentimentCollection(): Promise<{ ok: boolean; message: string }> {
  logger.info('Cron: Starting sentiment collection');
  await collectAllSentiment();
  logger.info('Cron: Sentiment collection complete');
  return { ok: true, message: 'Sentiment collection complete' };
}

export async function runAIInsights(): Promise<{ ok: boolean; message: string; insights?: string }> {
  logger.info('Cron: Generating AI insights');
  const result = await managerAgent({ type: 'full' });
  logger.info('Cron: AI insights complete');
  return { ok: true, message: 'AI insights complete', insights: result.finalInsight };
}
