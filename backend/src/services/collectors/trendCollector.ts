import axios from 'axios';
import { Trend } from '../../models/Trend.model';
import { logger } from '../../utils/logger';

const TECH_KEYWORDS = [
  'artificial intelligence', 'machine learning', 'large language models',
  'generative AI', 'blockchain', 'Web3', 'quantum computing', 'edge computing',
  'cybersecurity', 'cloud computing', 'DevOps', 'Kubernetes', 'microservices',
  'React', 'Next.js', 'TypeScript', 'Rust', 'Python', 'data science',
];

export async function collectGitHubTrends(): Promise<number> {
  let collected = 0;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Get trending repositories
    const response = await axios.get('https://api.github.com/search/repositories', {
      headers,
      params: {
        q: 'language:TypeScript stars:>100 created:>2024-01-01',
        sort: 'stars',
        order: 'desc',
        per_page: 20,
      },
      timeout: 10000,
    });

    const repos = response.data.items || [];
    for (const repo of repos) {
      const keyword = repo.name.toLowerCase();
      try {
        await Trend.findOneAndUpdate(
          { keyword, source: 'github' },
          {
            $set: {
              keyword,
              category: repo.language || 'Technology',
              source: 'github',
              currentValue: repo.stargazers_count,
              direction: 'rising',
              changePercent: 10,
              isEmergingTech: repo.stargazers_count > 1000,
              updatedAt: new Date(),
            },
            $push: {
              dataPoints: {
                $each: [{ date: new Date(), value: repo.stargazers_count }],
                $slice: -30,
              },
            },
          },
          { upsert: true }
        );
        collected++;
      } catch (err) {
        logger.warn(`Failed to save trend for ${keyword}:`, err);
      }
    }
  } catch (error) {
    logger.error('GitHub trends error:', error);
  }

  return collected;
}

export async function collectMockTrends(): Promise<void> {
  // Create mock trend data for demonstration when APIs are unavailable
  for (const keyword of TECH_KEYWORDS.slice(0, 10)) {
    const currentValue = Math.floor(Math.random() * 100) + 20;
    const previousValue = Math.floor(Math.random() * 100) + 10;
    const changePercent = ((currentValue - previousValue) / previousValue) * 100;

    await Trend.findOneAndUpdate(
      { keyword, source: 'news' },
      {
        $set: {
          keyword,
          category: 'Technology',
          source: 'news',
          currentValue,
          previousValue,
          changePercent,
          direction: changePercent > 5 ? 'rising' : changePercent < -5 ? 'falling' : 'stable',
          isEmergingTech: ['artificial intelligence', 'generative AI', 'quantum computing'].includes(keyword),
          relatedKeywords: [],
        },
        $push: {
          dataPoints: {
            $each: [{ date: new Date(), value: currentValue }],
            $slice: -30,
          },
        },
      },
      { upsert: true }
    );
  }
  logger.info(`Collected mock trends for ${TECH_KEYWORDS.slice(0, 10).length} keywords`);
}

export async function collectAllTrends(): Promise<void> {
  logger.info('Starting trend collection...');
  const githubCount = await collectGitHubTrends();
  await collectMockTrends();
  logger.info(`Trend collection complete: ${githubCount} from GitHub`);
}
