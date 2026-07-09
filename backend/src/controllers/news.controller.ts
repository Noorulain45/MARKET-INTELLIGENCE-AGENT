import { Request, Response, NextFunction } from 'express';
import { NewsArticle } from '../models/NewsArticle.model';
import { collectAllNews } from '../services/collectors/newsCollector';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { setCache, getCache } from '../config/redis';

export async function getNews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const source = req.query.source as string;
    const search = req.query.search as string;
    const importance = req.query.importance as string;

    const filter: Record<string, unknown> = {};
    if (category && category !== 'all') filter.category = category;
    if (source) filter.source = source;
    if (importance) filter.importance = importance;
    if (search) filter.$text = { $search: search };

    const [articles, total] = await Promise.all([
      NewsArticle.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
      NewsArticle.countDocuments(filter),
    ]);

    sendPaginated(res, articles, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getNewsById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const article = await NewsArticle.findByIdAndUpdate(
      req.params.id,
      { $inc: { readCount: 1 } },
      { new: true }
    ).lean();
    if (!article) {
      sendError(res, 'Article not found', 404);
      return;
    }
    sendSuccess(res, article);
  } catch (error) {
    next(error);
  }
}

export async function getNewsSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = 'news:summary';
    const cached = await getCache<object>(cacheKey);
    if (cached) {
      sendSuccess(res, cached, 'News summary (cached)');
      return;
    }

    const [byCategory, recent, topSources] = await Promise.all([
      NewsArticle.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      NewsArticle.find({}).sort({ publishedAt: -1 }).limit(5).select('title summary source publishedAt category importance').lean(),
      NewsArticle.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const summary = { byCategory, recent, topSources };
    await setCache(cacheKey, summary, 300);
    sendSuccess(res, summary);
  } catch (error) {
    next(error);
  }
}

export async function triggerNewsCollection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Fire and forget
    collectAllNews().catch(console.error);
    sendSuccess(res, null, 'News collection started');
  } catch (error) {
    next(error);
  }
}

export async function getNewsCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await NewsArticle.distinct('category');
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}
