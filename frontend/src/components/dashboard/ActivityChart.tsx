'use client';

import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function ActivityChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['activity-timeline'],
    queryFn: () => analyticsApi.getActivityTimeline(30),
    select: (res) => {
      const { newsTimeline, eventsTimeline } = res.data.data;
      // Merge into single series
      const dateMap: Record<string, { date: string; news: number; events: number; highImpact: number }> = {};
      newsTimeline.forEach((d: { _id: string; count: number }) => {
        dateMap[d._id] = { date: d._id, news: d.count, events: 0, highImpact: 0 };
      });
      eventsTimeline.forEach((d: { _id: string; count: number; highImpact: number }) => {
        if (dateMap[d._id]) {
          dateMap[d._id].events = d.count;
          dateMap[d._id].highImpact = d.highImpact;
        } else {
          dateMap[d._id] = { date: d._id, news: 0, events: d.count, highImpact: d.highImpact };
        }
      });
      return Object.values(dateMap)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(d => ({ ...d, date: formatDate(d.date, 'MMM d') }));
    },
  });

  if (isLoading) return (
    <Card>
      <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
      <CardContent><Skeleton className="h-64" /></CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline (30 days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
            <Legend iconType="circle" iconSize={8} />
            <Area type="monotone" dataKey="news" stroke="#3b82f6" fill="url(#colorNews)" strokeWidth={2} name="News Articles" />
            <Area type="monotone" dataKey="events" stroke="#8b5cf6" fill="url(#colorEvents)" strokeWidth={2} name="Market Events" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
