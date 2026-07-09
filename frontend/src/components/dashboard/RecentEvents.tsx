'use client';

import { ExternalLink, AlertTriangle, TrendingUp, DollarSign, Package, Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, cn } from '@/lib/utils';

interface MarketEvent {
  _id: string;
  title: string;
  type: string;
  competitorName?: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
}

const eventTypeIcon: Record<string, React.ElementType> = {
  funding: DollarSign,
  product_launch: Package,
  acquisition: TrendingUp,
  partnership: ExternalLink,
  news: Megaphone,
  default: AlertTriangle,
};

const impactVariant: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  high: 'destructive',
  medium: 'warning',
  low: 'secondary',
};

interface RecentEventsProps {
  events: MarketEvent[];
}

export default function RecentEvents({ events }: RecentEventsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Market Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No recent events</p>
        ) : (
          events.map((event) => {
            const Icon = eventTypeIcon[event.type] || eventTypeIcon.default;
            return (
              <div key={event._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className={cn('p-1.5 rounded-md mt-0.5', {
                  'bg-red-500/10 text-red-400': event.impact === 'high',
                  'bg-yellow-500/10 text-yellow-400': event.impact === 'medium',
                  'bg-slate-500/10 text-slate-400': event.impact === 'low',
                })}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {event.competitorName && (
                      <span className="text-xs text-muted-foreground">{event.competitorName}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(event.date)}</span>
                  </div>
                </div>
                <Badge variant={impactVariant[event.impact] || 'secondary'} className="text-xs flex-shrink-0">
                  {event.impact}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
