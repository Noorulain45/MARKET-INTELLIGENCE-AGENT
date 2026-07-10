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
  const response = await generateCompletion(
    `You are a sentiment analysis engine. Analyze the sentiment of the user's text.
Respond with ONLY a raw JSON object — no markdown, no code fences, no explanation before or after.
The JSON must have exactly these fields:
{
  "score": <number from -1.0 (very negative) to 1.0 (very positive)>,
  "label": <"positive" | "negative" | "neutral">,
  "topics": {
    "positive": [<up to 3 positive themes as short strings>],
    "negative": [<up to 3 negative themes as short strings>],
    "neutral": [<up to 3 neutral themes as short strings>]
  },
  "complaints": [<up to 3 complaint strings>],
  "featureRequests": [<up to 3 feature request strings>]
}`,
    text.slice(0, 2000),
    'llama-3.3-70b-versatile',
    600,
    0.1
  );

  // Extract the first {...} block — handles fences, preamble text, trailing prose
  const match = response.match(/\{[\s\S]*\}/);
  if (!match) {
    logger.error('analyzeSentiment: no JSON object found in response', { response });
    throw new Error('Sentiment model did not return a valid JSON object');
  }

  try {
    const parsed = JSON.parse(match[0]);

    // Coerce and validate key fields so the frontend never receives NaN/undefined
    const score = typeof parsed.score === 'number' && isFinite(parsed.score)
      ? Math.max(-1, Math.min(1, parsed.score))
      : 0;

    const validLabels = ['positive', 'negative', 'neutral'] as const;
    const label: 'positive' | 'negative' | 'neutral' = validLabels.includes(parsed.label)
      ? parsed.label
      : score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral';

    return {
      score,
      label,
      topics: {
        positive: Array.isArray(parsed.topics?.positive) ? parsed.topics.positive : [],
        negative: Array.isArray(parsed.topics?.negative) ? parsed.topics.negative : [],
        neutral:  Array.isArray(parsed.topics?.neutral)  ? parsed.topics.neutral  : [],
      },
      complaints:      Array.isArray(parsed.complaints)      ? parsed.complaints      : [],
      featureRequests: Array.isArray(parsed.featureRequests) ? parsed.featureRequests : [],
    };
  } catch (parseError) {
    logger.error('analyzeSentiment: JSON.parse failed', { raw: match[0], parseError });
    throw new Error('Failed to parse sentiment response from model');
  }
}
