'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MessageCircle, Smile, Frown, Meh, Loader2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { sentimentApi } from '@/lib/api';
import { sentimentColor, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SentimentPage() {
  const [analyzeText, setAnalyzeText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    score: number;
    label: string;
    topics: { positive: string[]; negative: string[]; neutral: string[] };
    complaints: string[];
    featureRequests: string[];
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sentiments'],
    queryFn: () => sentimentApi.getSentiments({ limit: 20 }),
    select: (res) => res.data.data || [],
  });

  const analyzeMutation = useMutation({
    mutationFn: (text: string) => sentimentApi.analyze(text),
    onSuccess: (res) => {
      const raw = res.data.data;
      // DB document uses `overallScore`; AI result uses `score` — normalise both
      setAnalysisResult({
        score: typeof raw.score === 'number' ? raw.score : raw.overallScore ?? 0,
        label: raw.label ?? 'neutral',
        topics: raw.topics ?? { positive: [], negative: [], neutral: [] },
        complaints: raw.complaints ?? [],
        featureRequests: raw.featureRequests ?? [],
      });
      toast.success('Analysis complete');
    },
    onError: () => toast.error('Analysis failed'),
  });

  const labelIcon = {
    positive: <Smile className="w-4 h-4 text-emerald-400" />,
    negative: <Frown className="w-4 h-4 text-red-400" />,
    neutral: <Meh className="w-4 h-4 text-yellow-400" />,
  };

  const radarData = (data || []).slice(0, 6).map((s: { keyword: string; overallScore: number }) => ({
    keyword: s.keyword,
    score: Math.round((s.overallScore + 1) * 50), // normalize to 0-100
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="w-6 h-6" /> Sentiment Analysis
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Understand customer perception and brand sentiment</p>
      </div>

      {/* Live analyzer */}
      <Card className="border-primary/30">
        <CardHeader><CardTitle className="text-base">Analyze Text</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={analyzeText}
              onChange={(e) => setAnalyzeText(e.target.value)}
              placeholder="Paste text to analyze sentiment..."
              className="flex-1"
            />
            <Button
              onClick={() => analyzeMutation.mutate(analyzeText)}
              disabled={!analyzeText.trim() || analyzeMutation.isPending}
              size="sm"
            >
              {analyzeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
            </Button>
          </div>
          {analysisResult && (
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {labelIcon[analysisResult.label as keyof typeof labelIcon]}
                  <span className={`font-semibold capitalize ${sentimentColor(analysisResult.label)}`}>{analysisResult.label}</span>
                  <span className="text-sm text-muted-foreground">({(analysisResult.score * 100).toFixed(0)}%)</span>
                </div>
                {analysisResult.complaints.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-red-400 mb-1">Complaints:</p>
                    {analysisResult.complaints.map((c, i) => <p key={i} className="text-xs text-muted-foreground">• {c}</p>)}
                  </div>
                )}
              </div>
              {analysisResult.featureRequests.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-blue-400 mb-1">Feature Requests:</p>
                  {analysisResult.featureRequests.map((f, i) => <p key={i} className="text-xs text-muted-foreground">• {f}</p>)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Radar chart */}
        {radarData.length > 2 && (
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="text-sm">Sentiment by Keyword</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="keyword" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="Score" dataKey="score" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Sentiment list */}
        <div className={`space-y-3 ${radarData.length > 2 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)
          ) : (data || []).length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-center">
              <MessageCircle className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground">No sentiment data collected yet</p>
            </div>
          ) : (
            (data || []).map((s: { _id: string; keyword: string; source: string; label: string; overallScore: number; analyzedAt: string; complaints: string[]; featureRequests: string[] }) => (
              <Card key={s._id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {labelIcon[s.label as keyof typeof labelIcon]}
                      <div>
                        <p className="font-medium text-sm">{s.keyword}</p>
                        <p className="text-xs text-muted-foreground">{s.source} · {formatRelativeTime(s.analyzedAt)}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${sentimentColor(s.label)}`}>
                        {(s.overallScore * 100).toFixed(0)}%
                      </p>
                      <Badge
                        variant={s.label === 'positive' ? 'success' : s.label === 'negative' ? 'destructive' : 'warning'}
                        className="text-xs capitalize"
                      >
                        {s.label}
                      </Badge>
                    </div>
                  </div>
                  {(s.complaints.length > 0 || s.featureRequests.length > 0) && (
                    <div className="flex gap-4 mt-3">
                      {s.complaints.length > 0 && (
                        <div className="flex-1">
                          <p className="text-xs font-medium text-red-400 mb-1">Top Complaint</p>
                          <p className="text-xs text-muted-foreground">{s.complaints[0]}</p>
                        </div>
                      )}
                      {s.featureRequests.length > 0 && (
                        <div className="flex-1">
                          <p className="text-xs font-medium text-blue-400 mb-1">Feature Request</p>
                          <p className="text-xs text-muted-foreground">{s.featureRequests[0]}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
