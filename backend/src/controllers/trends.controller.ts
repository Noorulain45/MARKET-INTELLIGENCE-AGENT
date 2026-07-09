import { Request, Response, NextFunction } from 'express';
import { Trend } from '../models/Trend.model';
import { collectAllTrends } from '../services/collectors/trendCollector';
import { sendSuccess, sendPaginated } from '../utils/apiResponse';
import { setCache, getCache } from '../config/redis';

export async function getTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const direction = req.query.direction as string;
    const source = req.query.source as string;
    const emerging = req.query.emerging === 'true';

    const filter: Record<string, unknown> = {};
    if (direction) filter.direction = direction;
    if (source) filter.source = source;
    if (emerging) filter.isEmergingTech = true;

    const [trends, total] = await Promise.all([
      Trend.find(filter).sort({ changePercent: -1 }).skip(skip).limit(limit).lean(),
      Trend.countDocuments(filter),
    ]);

    sendPaginated(res, trends, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getTrendsSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = 'trends:summary';
    const cached = await getCache<object>(cacheKey);
    if (cached) {
      sendSuccess(res, cached, 'Trends summary (cached)');
      return;
    }

    const [rising, falling, emerging, byCategory] = await Promise.all([
      Trend.find({ direction: 'rising' }).sort({ changePercent: -1 }).limit(10)
        .select('keyword category currentValue changePercent source').lean(),
      Trend.find({ direction: 'falling' }).sort({ changePercent: 1 }).limit(10)
        .select('keyword category currentValue changePercent source').lean(),
      Trend.find({ isEmergingTech: true }).sort({ currentValue: -1 }).limit(10)
        .select('keyword category currentValue changePercent').lean(),
      Trend.aggregate([
        { $group: { _id: '$category', avgChange: { $avg: '$changePercent' }, count: { $sum: 1 } } },
        { $sort: { avgChange: -1 } },
      ]),
    ]);

    const summary = { rising, falling, emerging, byCategory };
    await setCache(cacheKey, summary, 600);
    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
}

export async function getTrendById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trend = await Trend.findById(req.params.id).lean();
    if (!trend) {
      sendSuccess(res, null, 'Trend not found');
      return;
    }
    sendSuccess(res, trend);
  } catch (error) {
    next(error);
  }
}

export async function triggerTrendCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    collectAllTrends().catch(console.error);
    sendSuccess(res, null, 'Trend collection started');
  } catch (error) {
    next(error);
  }
}
