import { generateCompletion } from '../groqClient';
import { Competitor } from '../../../models/Competitor.model';
import { MarketEvent } from '../../../models/MarketEvent.model';
import { logger } from '../../../utils/logger';
import type { AgentTask } from './managerAgent';

export async function competitorAgent(task: AgentTask): Promise<string> {
  try {
    const competitors = await Competitor.find({ isActive: true })
      .limit(10)
      .select('name website industry description metrics lastActivity')
      .lean();

    if (competitors.length === 0) {
      return 'No competitors are currently being tracked.';
    }

    const recentEvents = await MarketEvent.find({})
      .sort({ date: -1 })
      .limit(15)
      .select('title type competitorName date impact aiSummary')
      .lean();

    const competitorList = competitors.map(c =>
      `- ${c.name} (${c.industry}): ${c.description || 'No description'}`
    ).join('\n');

    const eventList = recentEvents.map(e =>
      `- [${e.type.toUpperCase()}] ${e.competitorName || 'Unknown'}: ${e.title} (${new Date(e.date).toLocaleDateString()}, Impact: ${e.impact})`
    ).join('\n');

    const query = task.query || 'Analyze competitor landscape';

    return await generateCompletion(
      `You are a competitive intelligence analyst. Analyze the tracked competitors and recent market events.
       Identify key competitive threats, opportunities, and strategic movements.
       Provide actionable insights for business strategy. Be specific and data-driven.`,
      `Query: ${query}\n\nTracked Competitors:\n${competitorList}\n\nRecent Events:\n${eventList}`,
      'llama-3.3-70b-versatile',
      1024
    );
  } catch (error) {
    logger.error('Competitor Agent error:', error);
    return 'Competitor analysis temporarily unavailable.';
  }
}

export async function generateSWOT(competitor: {
  name: string;
  description?: string;
  industry: string;
  metrics?: Record<string, unknown>;
}): Promise<{ strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] }> {
  try {
    const response = await generateCompletion(
      `You are a strategic business analyst. Generate a SWOT analysis for the given company.
       Return a JSON object with arrays: strengths, weaknesses, opportunities, threats.
       Each array should contain 3-5 concise bullet points. Return ONLY valid JSON.`,
      `Company: ${competitor.name}
Industry: ${competitor.industry}
Description: ${competitor.description || 'No description available'}
Metrics: ${JSON.stringify(competitor.metrics || {})}`,
      'llama-3.3-70b-versatile',
      512,
      0.3
    );

    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error('SWOT generation error:', error);
    return {
      strengths: ['Data unavailable'],
      weaknesses: ['Data unavailable'],
      opportunities: ['Data unavailable'],
      threats: ['Data unavailable'],
    };
  }
}
