import axios from 'axios';
import { Sentiment } from '../../models/Sentiment.model';
import { Competitor } from '../../models/Competitor.model';
import { analyzeSentiment } from '../ai/agents/sentimentAgent';
import { logger } from '../../utils/logger';

let redditAccessToken: string | null = null;
let tokenExpiry: Date | null = null;

async function getRedditToken(): Promise<string | null> {
  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) return null;
  if (redditAccessToken && tokenExpiry && tokenExpiry > new Date()) return redditAccessToken;

  try {
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        auth: {
          username: process.env.REDDIT_CLIENT_ID,
          password: process.env.REDDIT_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': process.env.REDDIT_USER_AGENT || 'MarketIntelAgent/1.0',
        },
      }
    );
    redditAccessToken = response.data.access_token;
    tokenExpiry = new Date(Date.now() + response.data.expires_in * 1000);
    return redditAccessToken;
  } catch (error) {
    logger.warn('Reddit token error:', error);
    return null;
  }
}

export async function collectRedditSentiment(keyword: string, competitorId?: string): Promise<void> {
  const token = await getRedditToken();
  if (!token) return;

  try {
    const response = await axios.get(`https://oauth.reddit.com/search`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': process.env.REDDIT_USER_AGENT || 'MarketIntelAgent/1.0',
      },
      params: {
        q: keyword,
        sort: 'new',
        limit: 20,
        type: 'link',
      },
      timeout: 10000,
    });

    const posts = response.data?.data?.children || [];
    const textParts: string[] = [];

    for (const post of posts.slice(0, 10)) {
      const data = post.data;
      textParts.push(`${data.title} ${data.selftext || ''}`.trim());
    }

    if (textParts.length === 0) return;

    const combinedText = textParts.join('\n\n');
    const analysis = await analyzeSentiment(combinedText);

    await Sentiment.create({
      keyword,
      competitorId: competitorId ? competitorId : undefined,
      source: 'reddit',
      text: combinedText.slice(0, 5000),
      overallScore: analysis.score,
      label: analysis.label,
      topics: analysis.topics,
      featureRequests: analysis.featureRequests,
      complaints: analysis.complaints,
      analyzedAt: new Date(),
      dataPoints: [{ date: new Date(), score: analysis.score, volume: posts.length }],
    });
  } catch (error) {
    logger.warn(`Reddit sentiment error for ${keyword}:`, error);
  }
}

export async function collectAllSentiment(): Promise<void> {
  logger.info('Starting sentiment collection...');
  const competitors = await Competitor.find({ isActive: true }).select('name').lean();

  const tasks: Promise<void>[] = [];
  for (const competitor of competitors.slice(0, 5)) {
    tasks.push(collectRedditSentiment(competitor.name, competitor._id.toString()));
  }

  // General tech keywords
  tasks.push(collectRedditSentiment('artificial intelligence'));
  tasks.push(collectRedditSentiment('machine learning'));

  await Promise.allSettled(tasks);
  logger.info('Sentiment collection complete');
}
