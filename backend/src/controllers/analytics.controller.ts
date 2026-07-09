import { Request, Response, NextFunction } from 'express';
import { NewsArticle } from '../models/NewsArticle.model';
import { Competitor } from '../models/Competitor.model';
import { Trend } from '../models/Trend.model';
import { Sentiment } from '../models/Sentiment.model';
import { MarketEvent } from '../models/MarketEvent.model';
import { Alert } from '../models/Alert.model';
import { Report } from '../models/Report.model';
import { Notification } from '../models/Notification.model';
import { sendSuccess } from '../utils/apiResponse';
import { setCache, getCache } from '../config/redis';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = `dashboard:stats:${req.user!.id}`;
    const cached = await getCache<object>(cacheKey);
    if (cached) {
      sendSuccess(res, cached, 'Dashboard stats (cached)');
      return;
    }

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalNews, newNews,
      totalCompetitors,
      risingTrends,
      avgSentiment,
      recentEvents,
      activeAlerts,
      unreadNotifications,
      recentReports,
    ] = await Promise.all([
      NewsArticle.countDocuments(),
      NewsArticle.countDocuments({ publishedAt: { $gte: last24h } }),
      Competitor.countDocuments({ isActive: true }),
      Trend.countDocuments({ direction: 'rising' }),
      Sentiment.aggregate([{ $group: { _id: null, avg: { $avg: '$overallScore' } } }]),
      MarketEvent.find({}).sort({ date: -1 }).limit(10)
        .select('title type competitorName date impact').lean(),
      Alert.countDocuments({ userId: req.user!.id, isActive: true }),
      Notification.countDocuments({ userId: req.user!.id, isRead: false }),
      Report.find({ generatedBy: req.user!.id }).sort({ createdAt: -1 }).limit(3)
        .select('title type status createdAt').lean(),
    ]);

    const stats = {
      news: { total: totalNews, new: newNews },
      competitors: { total: totalCompetitors },
      trends: { rising: risingTrends },
      sentiment: { average: avgSentiment[0]?.avg || 0 },
      recentEvents,
      alerts: { active: activeAlerts },
      notifications: { unread: unreadNotifications },
      reports: recentReports,
    };

    await setCache(cacheKey, stats, 120);
    sendSuccess(res, stats, 'Dashboard stats');
  } catch (error) {
    next(error);
  }
}

export async function getActivityTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const days = Math.min(90, Number(req.query.days) || 30);
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [newsTimeline, eventsTimeline] = await Promise.all([
      NewsArticle.aggregate([
        { $match: { publishedAt: { $gte: start } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      MarketEvent.aggregate([
        { $match: { date: { $gte: start } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            count: { $sum: 1 },
            highImpact: { $sum: { $cond: [{ $eq: ['$impact', 'high'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    sendSuccess(res, { newsTimeline, eventsTimeline });
  } catch (error) {
    next(error);
  }
}

export async function getMarketOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = 'analytics:market:overview';
    const cached = await getCache<object>(cacheKey);
    if (cached) {
      sendSuccess(res, cached, 'Market overview (cached)');
      return;
    }

    const [industries, trendsByCategory, sentimentBySource, fundingEvents] = await Promise.all([
      Competitor.aggregate([
        { $group: { _id: '$industry', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Trend.aggregate([
        { $group: { _id: '$category', avgChange: { $avg: '$changePercent' }, count: { $sum: 1 } } },
        { $sort: { avgChange: -1 } },
        { $limit: 10 },
      ]),
      Sentiment.aggregate([
        { $group: { _id: '$source', avgScore: { $avg: '$overallScore' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      MarketEvent.find({ type: 'funding' }).sort({ date: -1 }).limit(10)
        .select('title competitorName date aiSummary').lean(),
    ]);

    const overview = { industries, trendsByCategory, sentimentBySource, fundingEvents };
    await setCache(cacheKey, overview, 900);
    sendSuccess(res, overview);
  } catch (error) {
    next(error);
  }
}
