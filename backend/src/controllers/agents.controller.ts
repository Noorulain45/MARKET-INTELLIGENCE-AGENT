import { Request, Response, NextFunction } from 'express';
import { managerAgent } from '../services/ai/agents/managerAgent';
import { newsAgent } from '../services/ai/agents/newsAgent';
import { competitorAgent } from '../services/ai/agents/competitorAgent';
import { trendAgent } from '../services/ai/agents/trendAgent';
import { sentimentAgent } from '../services/ai/agents/sentimentAgent';
import { recommendationAgent } from '../services/ai/agents/recommendationAgent';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { setCache, getCache } from '../config/redis';

export async function runManagerAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type = 'full', query, context } = req.body;
    const result = await managerAgent({ type, query, context });
    sendSuccess(res, result, 'Agent task completed');
  } catch (error) {
    next(error);
  }
}

export async function getDailySummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cacheKey = 'agents:daily:summary';
    const cached = await getCache<object>(cacheKey);
    if (cached) {
      sendSuccess(res, cached, 'Daily summary (cached)');
      return;
    }

    const result = await managerAgent({ type: 'full', query: 'Generate daily market intelligence briefing' });
    await setCache(cacheKey, result, 3600); // Cache for 1 hour
    sendSuccess(res, result, 'Daily summary generated');
  } catch (error) {
    next(error);
  }
}

export async function runSpecificAgent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { agentType } = req.params;
    const { query, context } = req.body;

    const task = { type: agentType as 'news' | 'competitor' | 'trend' | 'sentiment', query, context };
    let result: string;

    switch (agentType) {
      case 'news': result = await newsAgent(task); break;
      case 'competitor': result = await competitorAgent(task); break;
      case 'trend': result = await trendAgent(task); break;
      case 'sentiment': result = await sentimentAgent(task); break;
      case 'recommendation': result = await recommendationAgent(task); break;
      default:
        sendError(res, `Unknown agent type: ${agentType}`, 400);
        return;
    }

    sendSuccess(res, { result, agentType, timestamp: new Date() }, `${agentType} agent completed`);
  } catch (error) {
    next(error);
  }
}
