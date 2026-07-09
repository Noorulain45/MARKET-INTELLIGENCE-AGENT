import { Request, Response, NextFunction } from 'express';
import { Competitor } from '../models/Competitor.model';
import { MarketEvent } from '../models/MarketEvent.model';
import { generateSWOT } from '../services/ai/agents/competitorAgent';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse';
import { setCache, getCache } from '../config/redis';

export async function getCompetitors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const industry = req.query.industry as string;

    const filter: Record<string, unknown> = { isActive: true };
    if (search) filter.$text = { $search: search };
    if (industry) filter.industry = industry;

    const [competitors, total] = await Promise.all([
      Competitor.find(filter).sort({ activityCount: -1 }).skip(skip).limit(limit).lean(),
      Competitor.countDocuments(filter),
    ]);

    sendPaginated(res, competitors, total, page, limit);
  } catch (error) {
    next(error);
  }
}

export async function getCompetitorById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const competitor = await Competitor.findById(req.params.id).lean();
    if (!competitor) {
      sendError(res, 'Competitor not found', 404);
      return;
    }
    sendSuccess(res, competitor);
  } catch (error) {
    next(error);
  }
}

export async function createCompetitor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const competitor = await Competitor.create({
      ...req.body,
      addedBy: req.user!.id,
    });
    sendSuccess(res, competitor, 'Competitor added successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateCompetitor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const competitor = await Competitor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!competitor) {
      sendError(res, 'Competitor not found', 404);
      return;
    }
    sendSuccess(res, competitor, 'Competitor updated');
  } catch (error) {
    next(error);
  }
}

export async function deleteCompetitor(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const competitor = await Competitor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!competitor) {
      sendError(res, 'Competitor not found', 404);
      return;
    }
    sendSuccess(res, null, 'Competitor removed');
  } catch (error) {
    next(error);
  }
}

export async function getCompetitorActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const events = await MarketEvent.find({ competitorId: req.params.id })
      .sort({ date: -1 })
      .limit(20)
      .lean();
    sendSuccess(res, events);
  } catch (error) {
    next(error);
  }
}

export async function getSWOTAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = `swot:${req.params.id}`;
    const cached = await getCache<object>(cacheKey);
    if (cached) {
      sendSuccess(res, cached, 'SWOT analysis (cached)');
      return;
    }

    const competitor = await Competitor.findById(req.params.id).lean();
    if (!competitor) {
      sendError(res, 'Competitor not found', 404);
      return;
    }

    const swot = await generateSWOT({
      name: competitor.name,
      description: competitor.description,
      industry: competitor.industry,
      metrics: competitor.metrics as Record<string, unknown>,
    });

    await setCache(cacheKey, swot, 3600);
    sendSuccess(res, swot, 'SWOT analysis generated');
  } catch (error) {
    next(error);
  }
}

export async function compareCompetitors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ids = (req.query.ids as string)?.split(',').filter(Boolean) || [];
    if (ids.length < 2) {
      sendError(res, 'At least 2 competitor IDs required', 400);
      return;
    }

    const competitors = await Competitor.find({ _id: { $in: ids } }).lean();
    const events = await MarketEvent.find({ competitorId: { $in: ids } })
      .sort({ date: -1 })
      .limit(50)
      .lean();

    const comparison = competitors.map(c => ({
      ...c,
      recentEvents: events.filter(e => e.competitorId?.toString() === c._id.toString()).slice(0, 5),
    }));

    sendSuccess(res, comparison, 'Competitor comparison');
  } catch (error) {
    next(error);
  }
}
