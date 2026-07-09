'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, ExternalLink, Brain, TrendingUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { competitorApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AddCompetitorForm {
  name: string;
  website: string;
  industry: string;
  description?: string;
}

export default function CompetitorsPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [swotId, setSwotId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['competitors'],
    queryFn: () => competitorApi.getCompetitors(),
    select: (res) => res.data,
  });

  const { data: swot, isLoading: swotLoading } = useQuery({
    queryKey: ['swot', swotId],
    queryFn: () => competitorApi.getSWOT(swotId!),
    enabled: !!swotId,
    select: (res) => res.data.data,
  });

  const addMutation = useMutation({
    mutationFn: (d: AddCompetitorForm) => competitorApi.createCompetitor(d as Record<string, unknown>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitors'] });
      setShowAdd(false);
      reset();
      toast.success('Competitor added');
    },
    onError: () => toast.error('Failed to add competitor'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => competitorApi.deleteCompetitor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Competitor removed');
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddCompetitorForm>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" /> Competitors
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track and analyze your competition</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="w-4 h-4 mr-2" /> Add Competitor
        </Button>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-base">Add New Competitor</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((d) => addMutation.mutate(d))} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Company Name *</label>
                <Input {...register('name', { required: true })} placeholder="OpenAI" />
                {errors.name && <p className="text-xs text-destructive">Required</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Website *</label>
                <Input {...register('website', { required: true })} placeholder="https://openai.com" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Industry *</label>
                <Input {...register('industry', { required: true })} placeholder="Artificial Intelligence" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Description</label>
                <Input {...register('description')} placeholder="Brief description..." />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" size="sm" loading={addMutation.isPending}>Add</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SWOT Panel */}
      {swotId && (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" /> SWOT Analysis
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSwotId(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent>
            {swotLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
              </div>
            ) : swot ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['strengths', 'weaknesses', 'opportunities', 'threats'] as const).map((key) => (
                  <div key={key} className="rounded-lg p-4 bg-secondary">
                    <h4 className="text-sm font-semibold capitalize mb-2 flex items-center gap-1">
                      <span className={{
                        strengths: '🟢', weaknesses: '🔴', opportunities: '🟡', threats: '🟠'
                      }[key]} />
                      {key}
                    </h4>
                    <ul className="space-y-1">
                      {(swot[key] || []).map((item: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Competitors list */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (data?.data || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Users className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground">No competitors tracked yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data.data || []).map((c: {
            _id: string;
            name: string;
            industry: string;
            website: string;
            description?: string;
            activityCount: number;
            tags: string[];
          }) => (
            <Card key={c._id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{c.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">{c.industry}</Badge>
                  </div>
                  <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground">{c.description.slice(0, 100)}{c.description.length > 100 ? '...' : ''}</p>
                )}
                {c.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{c.activityCount} events tracked</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setSwotId(c._id)}
                  >
                    <Brain className="w-3 h-3 mr-1" /> SWOT
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(c._id)}
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
