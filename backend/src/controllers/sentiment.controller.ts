import { Request, Response, NextFunction } from 'express';
import { Sentiment } from '../models/Sentiment.model';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { setCache, getCache } from '../config/redis';
import { analyzeSentiment } from '../services/ai/agents/sentimentAgent';

export async function analyzeTextSentiment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { text, keyword, source = 'forums', competitorId } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      sendError(res, 'text is required', 400);
      return;
    }

    const result = await analyzeSentiment(text.trim());

    // Persist the result so it shows up in the overview/list
    const saved = await Sentiment.create({
      keyword: keyword || text.slice(0, 80),
      source,
      text: text.trim(),
      overallScore: result.score,
      label: result.label,
      topics: result.topics,
      complaints: result.complaints,
      featureRequests: result.featureRequests,
      analyzedAt: new Date(),
      ...(competitorId ? { competitorId } : {}),
    });

    // Return a flat object the frontend can consume directly.
    // The DB field is `overallScore` but the UI expects `score` — include both.
    sendSuccess(res, {
      ...saved.toObject(),
      score: result.score,        // alias so frontend `analysisResult.score` works
    }, 'Sentiment analysis complete', 201);
  } catch (error) {
    next(error);
  }
}

export async function getSentiments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const label = req.query.label as string;
    const source = req.query.source as string;
    const competitorId = req.query.competitorId as string;

    const filter: Record<string, unknown> = {};
    if (label) filter.label = label;
    if (source) filter.source = source;
    if (competitorId) filter.competitorId = competitorId;

    const [sentiments, total] = await Promise.all([
      Sentiment.find(filter).sort({ analyzedAt: -1 }).skip(skip).limit(limit)
        .populate('competitorId', 'name logo').lean(),
      Sentiment.countDocuments(filter),
    ]);

    sendPaginated(res, sentiments, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getSentimentOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = 'sentiment:overview';
    const cached = await getCache<object>(cacheKey);
    if (cached) {
      sendSuccess(res, cached, 'Sentiment overview (cached)');
      return;
    }

    const [distribution, timeline, topTopics, bySource] = await Promise.all([
      Sentiment.aggregate([
        { $group: { _id: '$label', count: { $sum: 1 }, avgScore: { $avg: '$overallScore' } } },
      ]),
      Sentiment.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$analyzedAt' } },
            avgScore: { $avg: '$overallScore' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
      Sentiment.aggregate([
        { $unwind: '$topics.positive' },
        { $group: { _id: '$topics.positive', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Sentiment.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 }, avgScore: { $avg: '$overallScore' } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const overview = { distribution, timeline, topTopics, bySource };
    await setCache(cacheKey, overview, 600);
    sendSuccess(res, overview);
  } catch (error) {
    next(error);
  }
}
