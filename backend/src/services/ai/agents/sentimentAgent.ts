import { generateCompletion } from '../groqClient';
import { Sentiment } from '../../../models/Sentiment.model';
import { logger } from '../../../utils/logger';
import type { AgentTask } from './managerAgent';

export async function sentimentAgent(task: AgentTask): Promise<string> {
  try {
    const recentSentiments = await Sentiment.find({})
      .sort({ analyzedAt: -1 })
      .limit(20)
      .select('keyword source label overallScore topics complaints featureRequests')
      .lean();

    if (recentSentiments.length === 0) {
      return 'No sentiment data currently available.';
    }

    const positive = recentSentiments.filter(s => s.label === 'positive');
    const negative = recentSentiments.filter(s => s.label === 'negative');
    const avgScore = recentSentiments.reduce((s, r) => s + r.overallScore, 0) / recentSentiments.length;

    const sentimentSummary = `
Overall Sentiment Score: ${(avgScore * 100).toFixed(1)}%
Positive Mentions: ${positive.length}
Negative Mentions: ${negative.length}
Neutral Mentions: ${recentSentiments.length - positive.length - negative.length}

Top Positive Themes: ${positive.slice(0, 3).flatMap(s => s.topics.positive).slice(0, 5).join(', ')}
Top Negative Themes: ${negative.slice(0, 3).flatMap(s => s.topics.negative).slice(0, 5).join(', ')}
Common Complaints: ${recentSentiments.flatMap(s => s.complaints).slice(0, 5).join(', ')}
Feature Requests: ${recentSentiments.flatMap(s => s.featureRequests).slice(0, 5).join(', ')}
    `.trim();

    const query = task.query || 'Analyze customer sentiment';

    return await generateCompletion(
      `You are a customer sentiment analyst. Analyze the customer feedback data and provide insights.
       Identify key pain points, satisfaction drivers, feature opportunities, and risk areas.
       Give actionable recommendations for product and marketing teams.`,
      `Query: ${query}\n\nSentiment Data:\n${sentimentSummary}`,
      'llama-3.3-70b-versatile',
      1024
    );
  } catch (error) {
    logger.error('Sentiment Agent error:', error);
    return 'Sentiment analysis temporarily unavailable.';
  }
}

export async function analyzeSentiment(text: string): Promise<{
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  topics: { positive: string[]; negative: string[]; neutral: string[] };
  complaints: string[];
  featureRequests: string[];
}> {
  try {
    const response = await generateCompletion(
      `Analyze the sentiment of the following text. Return a JSON object with:
       - score: number between -1 (very negative) and 1 (very positive)
       - label: "positive", "negative", or "neutral"
       - topics: { positive: string[], negative: string[], neutral: string[] }
       - complaints: string[] (max 3)
       - featureRequests: string[] (max 3)
       Return ONLY valid JSON, no explanation.`,
      text.slice(0, 2000),
      'llama-3.3-70b-versatile',
      512,
      0.1
    );
    const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    logger.error('Sentiment analysis error:', error);
    return {
      score: 0,
      label: 'neutral',
      topics: { positive: [], negative: [], neutral: [] },
      complaints: [],
      featureRequests: [],
    };
  }
}
