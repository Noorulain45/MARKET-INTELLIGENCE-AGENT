'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Newspaper, Users, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { searchApi } from '@/lib/api';
import { formatRelativeTime, truncate } from '@/lib/utils';

interface SearchResult {
  _id: string;
  type: 'news' | 'competitor' | 'trend';
  title?: string;
  name?: string;
  keyword?: string;
  summary?: string;
  description?: string;
  source?: string;
  publishedAt?: string;
  industry?: string;
  direction?: string;
  changePercent?: number;
}

export default function SearchPage() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const { data } = await searchApi.search(q);
      setResults(data.data || []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query) doSearch(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
  };

  const typeIcon = { news: Newspaper, competitor: Users, trend: TrendingUp };
  const typeColor: Record<string, string> = {
    news: 'text-blue-400 bg-blue-400/10',
    competitor: 'text-violet-400 bg-violet-400/10',
    trend: 'text-emerald-400 bg-emerald-400/10',
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="w-6 h-6" /> Search
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Search across news, competitors, and trends</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search everything..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{results.length} results for &quot;{query}&quot;</p>
          {results.map((r) => {
            const Icon = typeIcon[r.type] || Search;
            const title = r.title || r.name || r.keyword || '';
            const desc = r.summary || r.description || '';
            return (
              <Card key={r._id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`p-1.5 rounded-md mt-0.5 ${typeColor[r.type] || 'bg-secondary'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{title}</p>
                      <Badge variant="secondary" className="text-xs capitalize">{r.type}</Badge>
                    </div>
                    {desc && <p className="text-xs text-muted-foreground mt-1">{truncate(desc, 120)}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {r.source && <span className="text-xs text-muted-foreground">{r.source}</span>}
                      {r.industry && <span className="text-xs text-muted-foreground">{r.industry}</span>}
                      {r.publishedAt && <span className="text-xs text-muted-foreground">{formatRelativeTime(r.publishedAt)}</span>}
                      {r.direction && <span className="text-xs text-emerald-400">{r.direction} {r.changePercent ? `(+${r.changePercent.toFixed(1)}%)` : ''}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : query ? (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No results for &quot;{query}&quot;</p>
        </div>
      ) : (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Enter a search query to get started</p>
        </div>
      )}
    </div>
  );
}
