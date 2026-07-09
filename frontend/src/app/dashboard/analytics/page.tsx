'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart2, DollarSign } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ActivityChart from '@/components/dashboard/ActivityChart';
import { analyticsApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function AnalyticsPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['market-overview'],
    queryFn: () => analyticsApi.getMarketOverview(),
    select: (res) => res.data.data,
  });

  const industryData = (overview?.industries || []).map((i: { _id: string; count: number }) => ({
    name: i._id || 'Other',
    value: i.count,
  }));

  const trendCatData = (overview?.trendsByCategory || []).map((t: { _id: string; avgChange: number; count: number }) => ({
    name: t._id || 'Other',
    avg: parseFloat((t.avgChange || 0).toFixed(1)),
    count: t.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="w-6 h-6" /> Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Market-wide intelligence overview</p>
      </div>

      {/* Activity timeline */}
      <ActivityChart />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Industries pie */}
        <Card>
          <CardHeader><CardTitle>Competitors by Industry</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-56" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={industryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" nameKey="name" paddingAngle={3}>
                    {industryData.map((_: unknown, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Trends by category */}
        <Card>
          <CardHeader><CardTitle>Trend Change by Category</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-56" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendCatData.slice(0, 8)} margin={{ top: 5, right: 5, left: -20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '12px' }} formatter={(v) => [`${v}%`, 'Avg Change']} />
                  <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent funding events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Recent Funding Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (overview?.fundingEvents || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No funding events tracked yet</p>
          ) : (
            <div className="space-y-3">
              {(overview.fundingEvents || []).map((e: { _id: string; title: string; competitorName?: string; date: string; aiSummary?: string }) => (
                <div key={e._id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{e.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {e.competitorName && <span className="text-xs text-muted-foreground">{e.competitorName}</span>}
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(e.date)}</span>
                    </div>
                    {e.aiSummary && <p className="text-xs text-muted-foreground mt-1">{e.aiSummary.slice(0, 120)}...</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
