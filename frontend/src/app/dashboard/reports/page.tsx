'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Trash2, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { reportsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { id: 'daily', label: 'Daily Briefing' },
  { id: 'weekly', label: 'Weekly Summary' },
  { id: 'competitor', label: 'Competitor Analysis' },
  { id: 'sentiment', label: 'Sentiment Report' },
  { id: 'trend', label: 'Trend Analysis' },
];

const statusIcon = {
  completed: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  generating: <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
  failed: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  pending: <Clock className="w-3.5 h-3.5 text-yellow-400" />,
};

const statusVariant: Record<string, 'success' | 'info' | 'destructive' | 'warning'> = {
  completed: 'success',
  generating: 'info',
  failed: 'destructive',
  pending: 'warning',
};

export default function ReportsPage() {
  const qc = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedType, setSelectedType] = useState('daily');
  const [selectedReport, setSelectedReport] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.getReports(),
    select: (res) => res.data.data || [],
    refetchInterval: (query) => {
      const reports = query.state.data as Array<{ status: string }> || [];
      const hasGenerating = reports.some((r) => r.status === 'generating');
      return hasGenerating ? 5000 : false;
    },
  });

  const generateMutation = useMutation({
    mutationFn: () => reportsApi.generateReport({ type: selectedType }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      setShowGenerate(false);
      toast.success('Report generation started');
    },
    onError: () => toast.error('Failed to generate report'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reportsApi.deleteReport(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      setSelectedReport(null);
      toast.success('Report deleted');
    },
  });

  const viewReport = async (id: string) => {
    try {
      const { data } = await reportsApi.getReportById(id);
      setSelectedReport(data.data);
    } catch {
      toast.error('Failed to load report');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" /> Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-generated market intelligence reports</p>
        </div>
        <Button size="sm" onClick={() => setShowGenerate(!showGenerate)}>
          <Plus className="w-4 h-4 mr-2" /> Generate Report
        </Button>
      </div>

      {showGenerate && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-base">Generate New Report</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {REPORT_TYPES.map(t => (
                <Button
                  key={t.id}
                  variant={selectedType === t.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(t.id)}
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => generateMutation.mutate()} loading={generateMutation.isPending}>
                Generate
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowGenerate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report detail */}
      {selectedReport && (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{String(selectedReport.title)}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(selectedReport.content as Record<string, string> | undefined) && Object.entries(selectedReport.content as Record<string, string>).map(([key, value]) => (
              value ? (
                <div key={key}>
                  <h4 className="text-sm font-semibold capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                  <div className="text-sm text-muted-foreground ai-prose bg-secondary rounded-lg p-3">{value}</div>
                </div>
              ) : null
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reports list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (data || []).length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <FileText className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground">No reports yet. Generate your first report above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(data || []).map((r: { _id: string; title: string; type: string; status: string; createdAt: string }) => (
            <Card key={r._id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-secondary text-muted-foreground">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{r.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs capitalize">{r.type}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {statusIcon[r.status as keyof typeof statusIcon] || statusIcon.pending}
                    <Badge variant={statusVariant[r.status] || 'secondary'} className="text-xs capitalize">
                      {r.status}
                    </Badge>
                  </div>
                  {r.status === 'completed' && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => viewReport(r._id)}>
                      View
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(r._id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
