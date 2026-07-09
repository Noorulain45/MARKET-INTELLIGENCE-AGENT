import { NewsArticle } from '../../models/NewsArticle.model';
import { Trend } from '../../models/Trend.model';
import { MarketEvent } from '../../models/MarketEvent.model';
import { generateEmbedding, cosineSimilarity } from './embeddingService';
import { generateCompletion } from './groqClient';
import { logger } from '../../utils/logger';

interface RetrievedDoc {
  content: string;
  source: string;
  url?: string;
  type: string;
  score: number;
}

export async function retrieveRelevantDocs(query: string, limit = 5): Promise<RetrievedDoc[]> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const docs: RetrievedDoc[] = [];

    // Fetch from news with text search fallback
    const newsItems = await NewsArticle.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(20).lean();

    for (const item of newsItems) {
      const text = `${item.title}. ${item.summary || item.content.slice(0, 500)}`;
      const score = item.embedding
        ? cosineSimilarity(queryEmbedding, item.embedding)
        : 0.5;
      docs.push({
        content: text,
        source: item.source,
        url: item.url,
        type: 'news',
        score,
      });
    }

    // Fetch market events
    const events = await MarketEvent.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(10).lean();

    for (const event of events) {
      docs.push({
        content: `${event.title}: ${event.description}`,
        source: event.source,
        url: event.sourceUrl,
        type: 'market_event',
        score: 0.6,
      });
    }

    // Fetch trends
    const trends = await Trend.find({ keyword: { $regex: query, $options: 'i' } })
      .limit(5).lean();

    for (const trend of trends) {
      docs.push({
        content: `Trend: ${trend.keyword} is ${trend.direction} (${trend.changePercent.toFixed(1)}% change). ${trend.insights || ''}`,
        source: trend.source,
        type: 'trend',
        score: 0.7,
      });
    }

    // Sort by score and return top results
    return docs.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    logger.error('RAG retrieval error:', error);
    return [];
  }
}

export async function ragChat(
  query: string,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<{ response: string; sources: RetrievedDoc[] }> {
  try {
    const relevantDocs = await retrieveRelevantDocs(query, 5);

    const context = relevantDocs.length > 0
      ? relevantDocs.map((d, i) => `[Source ${i + 1} - ${d.type}] ${d.content}`).join('\n\n')
      : 'No specific market data found for this query.';

    const historyStr = conversationHistory.slice(-6).map(m =>
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
    ).join('\n');

    const systemPrompt = `You are an AI Market Intelligence Assistant with access to real-time market data.
You help businesses understand competitor activities, market trends, customer sentiment, and strategic opportunities.
Use the provided context to give accurate, data-driven answers. Cite sources when possible.
If the context doesn't contain relevant information, say so and provide general market intelligence knowledge.

Current Market Data Context:
${context}`;

    const userMessage = conversationHistory.length > 0
      ? `Previous conversation:\n${historyStr}\n\nCurrent question: ${query}`
      : query;

    const response = await generateCompletion(
      systemPrompt,
      userMessage,
      'llama-3.3-70b-versatile',
      2048
    );

    return { response, sources: relevantDocs };
  } catch (error) {
    logger.error('RAG chat error:', error);
    throw error;
  }
}
