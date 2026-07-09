import axios from 'axios';
import RSSParser from 'rss-parser';
import { NewsArticle } from '../../models/NewsArticle.model';
import { summarizeArticle, categorizeArticle } from '../ai/agents/newsAgent';
import { generateEmbedding } from '../ai/embeddingService';
import { logger } from '../../utils/logger';

const rssParser = new RSSParser();

const RSS_FEEDS = [
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' },
  { url: 'https://feeds.feedburner.com/venturebeat/SZYF', source: 'VentureBeat' },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired' },
  { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', source: 'WSJ Markets' },
];

export async function collectNewsFromAPI(): Promise<number> {
  let collected = 0;

  if (process.env.NEWS_API_KEY) {
    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          apiKey: process.env.NEWS_API_KEY,
          category: 'technology',
          language: 'en',
          pageSize: 30,
        },
        timeout: 10000,
      });

      const articles = response.data.articles || [];
      for (const article of articles) {
        if (!article.url || !article.title || !article.content) continue;
        try {
          const existing = await NewsArticle.findOne({ url: article.url });
          if (existing) continue;

          const summary = await summarizeArticle(article.title, article.content || article.description || '');
          const category = await categorizeArticle(article.title, article.content || '');
          const embedding = await generateEmbedding(`${article.title} ${summary}`);

          await NewsArticle.create({
            title: article.title,
            content: article.content || article.description || '',
            summary,
            url: article.url,
            source: article.source?.name || 'NewsAPI',
            author: article.author,
            publishedAt: new Date(article.publishedAt),
            imageUrl: article.urlToImage,
            category,
            embedding,
            isProcessed: true,
          });
          collected++;
        } catch (err) {
          logger.warn(`Failed to process article: ${article.url}`, err);
        }
      }
    } catch (error) {
      logger.error('NewsAPI collection error:', error);
    }
  }

  return collected;
}

export async function collectNewsFromRSS(): Promise<number> {
  let collected = 0;

  for (const feed of RSS_FEEDS) {
    try {
      const parsed = await rssParser.parseURL(feed.url);
      for (const item of (parsed.items || []).slice(0, 10)) {
        if (!item.link || !item.title) continue;
        try {
          const existing = await NewsArticle.findOne({ url: item.link });
          if (existing) continue;

          const content = item.contentSnippet || item.content || item.summary || item.title;
          const summary = await summarizeArticle(item.title, content);
          const category = await categorizeArticle(item.title, content);
          const embedding = await generateEmbedding(`${item.title} ${summary}`);

          await NewsArticle.create({
            title: item.title,
            content,
            summary,
            url: item.link,
            source: feed.source,
            author: item.creator,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            imageUrl: item.enclosure?.url,
            category,
            embedding,
            isProcessed: true,
          });
          collected++;
        } catch (err) {
          logger.warn(`Failed to process RSS item: ${item.link}`, err);
        }
      }
    } catch (error) {
      logger.warn(`RSS feed error for ${feed.url}:`, error);
    }
  }

  return collected;
}

export async function collectAllNews(): Promise<void> {
  logger.info('Starting news collection...');
  const [apiCount, rssCount] = await Promise.all([
    collectNewsFromAPI(),
    collectNewsFromRSS(),
  ]);
  logger.info(`News collection complete: ${apiCount} from API, ${rssCount} from RSS`);
}
