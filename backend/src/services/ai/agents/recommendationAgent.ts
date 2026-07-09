import { generateCompletion } from '../groqClient';
import { logger } from '../../../utils/logger';
import type { AgentTask } from './managerAgent';

export async function recommendationAgent(task: AgentTask): Promise<string> {
  try {
    const ctx = task.context || {};
    const contextStr = [
      ctx.newsInsights && `NEWS INSIGHTS:\n${ctx.newsInsights}`,
      ctx.competitorInsights && `COMPETITOR INSIGHTS:\n${ctx.competitorInsights}`,
      ctx.trendInsights && `TREND INSIGHTS:\n${ctx.trendInsights}`,
      ctx.sentimentInsights && `SENTIMENT INSIGHTS:\n${ctx.sentimentInsights}`,
    ].filter(Boolean).join('\n\n');

    const query = task.query || 'Provide strategic business recommendations';

    return await generateCompletion(
      `You are a strategic business consultant and Chief Strategy Officer.
       Based on the market intelligence provided, generate specific, actionable strategic recommendations.
       Include:
       1. Immediate opportunities to capitalize on (next 30 days)
       2. Medium-term strategic moves (3-6 months)
       3. Risk mitigation strategies
       4. Competitive advantages to build
       Be specific, quantitative where possible, and prioritize by impact.`,
      `Query: ${query}\n\nMarket Intelligence Context:\n${contextStr || 'Limited data available. Provide general strategic guidance.'}`,
      'llama-3.3-70b-versatile',
      1500
    );
  } catch (error) {
    logger.error('Recommendation Agent error:', error);
    return 'Strategic recommendations temporarily unavailable.';
  }
}
