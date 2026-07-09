import { generateCompletion } from '../groqClient';
import { Trend } from '../../../models/Trend.model';
import { logger } from '../../../utils/logger';
import type { AgentTask } from './managerAgent';

export async function trendAgent(task: AgentTask): Promise<string> {
  try {
    const risingTrends = await Trend.find({ direction: 'rising' })
      .sort({ changePercent: -1 })
      .limit(10)
      .select('keyword category source currentValue changePercent relatedKeywords')
      .lean();

    const emergingTech = await Trend.find({ isEmergingTech: true })
      .sort({ currentValue: -1 })
      .limit(5)
      .select('keyword category currentValue changePercent')
      .lean();

    if (risingTrends.length === 0 && emergingTech.length === 0) {
      return 'No trend data currently available.';
    }

    const trendList = risingTrends.map(t =>
      `- ${t.keyword} (${t.category}): +${t.changePercent.toFixed(1)}% | Source: ${t.source}`
    ).join('\n');

    const techList = emergingTech.map(t =>
      `- ${t.keyword}: Score ${t.currentValue} (+${t.changePercent.toFixed(1)}%)`
    ).join('\n');

    const query = task.query || 'Identify key market trends';

    return await generateCompletion(
      `You are a market trends analyst. Analyze the current trending topics and emerging technologies.
       Identify growth opportunities, declining markets, and predict future trends.
       Provide strategic insights that help businesses stay ahead. Be specific and forward-looking.`,
      `Query: ${query}\n\nRising Trends:\n${trendList}\n\nEmerging Technologies:\n${techList}`,
      'llama-3.3-70b-versatile',
      1024
    );
  } catch (error) {
    logger.error('Trend Agent error:', error);
    return 'Trend analysis temporarily unavailable.';
  }
}
