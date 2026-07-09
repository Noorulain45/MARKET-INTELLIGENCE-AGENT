import { Request, Response, NextFunction } from 'express';
import { NewsArticle } from '../models/NewsArticle.model';
import { Competitor } from '../models/Competitor.model';
import { Trend } from '../models/Trend.model';
import { MarketEvent } from '../models/MarketEvent.model';
import { retrieveRelevantDocs } from '../services/ai/ragService';
import { sendSuccess, sendError } from '../utils/apiResponse';

export async function semanticSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      sendError(res, 'Query must be at least 2 characters', 400);
      return;
    }

    const limit = Math.min(20, Number(req.query.limit) || 10);
    const type = req.query.type as string;

    const results: Record<string, unknown[]> = {};

    if (!type || type === 'all' || type === 'news') {
      results.news = await NewsArticle.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).limit(limit)
        .select('title summary source publishedAt category url').lean();
    }

    if (!type || type === 'all' || type === 'competitors') {
      results.competitors = await Competitor.find(
        { $text: { $search: query }, isActive: true },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).limit(limit)
        .select('name website industry description').lean();
    }

    if (!type || type === 'all' || type === 'trends') {
      results.trends = await Trend.find({
        keyword: { $regex: query, $options: 'i' },
      }).limit(limit).select('keyword category direction changePercent').lean();
    }

    if (!type || type === 'all' || type === 'events') {
      results.events = await MarketEvent.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } }).limit(limit)
        .select('title type competitorName date impact').lean();
    }

    // Semantic search using embeddings
    if (!type || type === 'all') {
      results.semantic = await retrieveRelevantDocs(query, 5);
    }

    sendSuccess(res, results, `Search results for "${query}"`);
  } catch (error) {
    next(error);
  }
}
