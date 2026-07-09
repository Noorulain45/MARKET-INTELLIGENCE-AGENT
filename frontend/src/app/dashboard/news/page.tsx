'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Newspaper, ExternalLink, Clock, Search, RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { newsApi } from '@/lib/api';
import { formatRelativeTime, importanceColor, truncate } from '@/lib/utils';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'AI', 'Technology', 'Business', 'Finance', 'Startups', 'Funding', 'Cybersecurity'];

export default function NewsPage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [collecting, setCollecting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['news', { category, search, page }],
    queryFn: () => newsApi.getNews({ category: category === 'all' ? undefined : category, search: search || undefined, page, limit: 20 }),
    select: (res) => res.data,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCollect = async () => {
    setCollecting(true);
    try {
      await newsApi.triggerCollection();
      toast.success('News collection started in background');
      setTimeout(() => refetch(), 5000);
    } catch {
      toast.error('Failed to start collection');
    } finally {
      setCollecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="w-6 h-6" /> News Feed
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.total || 0} articles collected
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleCollect} disabled={collecting}>
          <RefreshCw className={`w-4 h-4 mr-2 ${collecting ? 'animate-spin' : ''}`} />
          Collect Now
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              size="sm"
              className="text-xs whitespace-nowrap"
              onClick={() => { setCategory(cat); setPage(1); }}
            >
              {cat === 'all' ? 'All' : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {(data?.data || []).map((article: {
              _id: string;
              title: string;
              summary?: string;
              source: string;
              category: string;
              publishedAt: string;
              importance: string;
              url: string;
              imageUrl?: string;
            }) => (
              <Card key={article._id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {article.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-20 h-16 object-cover rounded-md flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm leading-tight">{article.title}</h3>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary flex-shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      {article.summary && (
                        <p className="text-xs text-muted-foreground mt-1">{truncate(article.summary, 140)}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${importanceColor(article.importance)}`}>
                          {article.importance}
                        </span>
                        <span className="text-xs text-muted-foreground">{article.source}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(article.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
