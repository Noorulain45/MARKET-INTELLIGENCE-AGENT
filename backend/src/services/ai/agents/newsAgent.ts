import { generateCompletion } from '../groqClient';
import { NewsArticle } from '../../../models/NewsArticle.model';
import { logger } from '../../../utils/logger';
import type { AgentTask } from './managerAgent';

export async function newsAgent(task: AgentTask): Promise<string> {
  try {
    // Fetch recent unprocessed or latest news
    const recentNews = await NewsArticle.find({})
      .sort({ publishedAt: -1 })
      .limit(20)
      .select('title summary category source publishedAt importance')
      .lean();

    if (recentNews.length === 0) {
      return 'No recent news articles found in the database.';
    }

    const newsSummary = recentNews.map(n =>
      `[${n.category}] ${n.title} (${n.source}, ${new Date(n.publishedAt).toLocaleDateString()})`
    ).join('\n');

    const query = task.query || 'Provide a market intelligence summary';

    return await generateCompletion(
      `You are a market intelligence news analyst. Analyze the following recent news articles
       and provide key insights about market developments, important events, and emerging patterns.
       Focus on business impact and strategic relevance. Be concise and actionable.`,
      `Query: ${query}\n\nRecent News:\n${newsSummary}`,
      'llama-3.3-70b-versatile',
      1024
    );
  } catch (error) {
    logger.error('News Agent error:', error);
    return 'News analysis temporarily unavailable.';
  }
}

export async function summarizeArticle(title: string, content: string): Promise<string> {
  return generateCompletion(
    'You are a professional news summarizer. Create a concise 2-3 sentence executive summary of the article. Focus on key facts, business impact, and market relevance.',
    `Title: ${title}\n\nContent: ${content.slice(0, 3000)}`,
    'llama-3.3-70b-versatile',
    256
  );
}

export async function categorizeArticle(title: string, content: string): Promise<string> {
  const response = await generateCompletion(
    `Categorize the following news article into exactly ONE of these categories:
     AI, Technology, Business, Finance, Product Launches, Startups, Funding, Acquisitions, Marketing, Cybersecurity, Other
     Respond with ONLY the category name, nothing else.`,
    `Title: ${title}\n\nContent: ${content.slice(0, 1000)}`,
    'llama-3.3-70b-versatile',
    20,
    0.1
  );
  return response.trim();
}
