import { generateCompletion } from '../groqClient';
import { newsAgent } from './newsAgent';
import { competitorAgent } from './competitorAgent';
import { trendAgent } from './trendAgent';
import { sentimentAgent } from './sentimentAgent';
import { recommendationAgent } from './recommendationAgent';
import { logger } from '../../../utils/logger';

export interface AgentTask {
  type: 'news' | 'competitor' | 'trend' | 'sentiment' | 'recommendation' | 'full';
  context?: Record<string, unknown>;
  query?: string;
}

export interface AgentResult {
  news?: string;
  competitor?: string;
  trend?: string;
  sentiment?: string;
  recommendation?: string;
  finalInsight?: string;
  sources?: string[];
  timestamp: Date;
}

export async function managerAgent(task: AgentTask): Promise<AgentResult> {
  logger.info(`Manager Agent: Processing task type=${task.type}`);
  const result: AgentResult = { timestamp: new Date() };

  try {
    // Run agents in parallel based on task type
    const agentPromises: Promise<void>[] = [];

    if (task.type === 'full' || task.type === 'news') {
      agentPromises.push(
        newsAgent(task).then(r => { result.news = r; })
      );
    }
    if (task.type === 'full' || task.type === 'competitor') {
      agentPromises.push(
        competitorAgent(task).then(r => { result.competitor = r; })
      );
    }
    if (task.type === 'full' || task.type === 'trend') {
      agentPromises.push(
        trendAgent(task).then(r => { result.trend = r; })
      );
    }
    if (task.type === 'full' || task.type === 'sentiment') {
      agentPromises.push(
        sentimentAgent(task).then(r => { result.sentiment = r; })
      );
    }

    await Promise.allSettled(agentPromises);

    // Generate final insight combining all agent outputs
    if (task.type === 'full' || task.type === 'recommendation') {
      result.recommendation = await recommendationAgent({
        ...task,
        context: {
          ...task.context,
          newsInsights: result.news,
          competitorInsights: result.competitor,
          trendInsights: result.trend,
          sentimentInsights: result.sentiment,
        },
      });
    }

    // Generate combined executive insight
    if (task.type === 'full') {
      const parts = [result.news, result.competitor, result.trend, result.sentiment, result.recommendation]
        .filter(Boolean).join('\n\n');

      result.finalInsight = await generateCompletion(
        `You are the Chief Intelligence Officer of a market intelligence platform.
         Synthesize the following agent reports into a concise executive briefing (max 300 words).
         Focus on the most actionable insights and strategic implications.`,
        parts,
        'llama-3.3-70b-versatile',
        800
      );
    }

    logger.info('Manager Agent: Task completed successfully');
    return result;
  } catch (error) {
    logger.error('Manager Agent error:', error);
    result.finalInsight = 'Unable to generate insights at this time. Please try again.';
    return result;
  }
}
