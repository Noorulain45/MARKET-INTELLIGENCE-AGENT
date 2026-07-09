'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { trendsApi } from '@/lib/api';
import { trendColor } from '@/lib/utils';

const directionIcon = {
  rising: TrendingUp,
  falling: TrendingDown,
  stable: Minus,
};

export default function TrendsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['trends'],
    queryFn: () => trendsApi.getTrends({ limit: 30 }),
    select: (res) => res.data.data || [],
  });

  const { data: emerging } = useQuery({
    queryKey: ['trends-emerging'],
    queryFn: () => trendsApi.getEmergingTech(),
    select: (res) => res.data.data || [],
  });

  const chartData = (data || [])
    .slice(0, 12)
    .map((t: { keyword: string; changePercent: number; direction: string }) => ({
      name: t.keyword.length > 14 ? t.keyword.slice(0, 14) + '…' : t.keyword,
      change: parseFloat(t.changePercent.toFixed(1)),
      fill: t.direction === 'rising' ? '#10b981' : t.direction === 'falling' ? '#ef4444' : '#6b7280',
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6" /> Market Trends
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track keyword and technology momentum</p>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader><CardTitle>Trend Change % (Top Keywords)</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-56" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }}
                  formatter={(v) => [`${v}%`, 'Change']}
                />
                <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <rect key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trend list */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold">All Trends</h2>
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14" />)
          ) : (
            (data || []).map((t: { _id: string; keyword: string; category: string; direction: string; changePercent: number; currentValue: number; source: string; isEmergingTech?: boolean }) => {
              const Icon = directionIcon[t.direction as keyof typeof directionIcon] || Minus;
              return (
                <Card key={t._id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-3 flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-secondary ${trendColor(t.direction)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{t.keyword}</p>
                        {t.isEmergingTech && (
                          <Badge variant="info" className="text-xs flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5" /> Emerging
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{t.category} · {t.source}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${trendColor(t.direction)}`}>
                        {t.changePercent > 0 ? '+' : ''}{t.changePercent.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">score {t.currentValue}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Emerging tech */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Emerging Technologies
          </h2>
          {(emerging || []).map((t: { _id: string; keyword: string; currentValue: number; changePercent: number }) => (
            <Card key={t._id}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{t.keyword}</p>
                  <Badge variant="success" className="text-xs">+{t.changePercent.toFixed(0)}%</Badge>
                </div>
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(100, t.currentValue)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Score: {t.currentValue}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
