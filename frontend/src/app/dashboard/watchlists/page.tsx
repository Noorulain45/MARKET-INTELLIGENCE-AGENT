'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Plus, Trash2, Edit2, Tag, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { watchlistApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const watchlistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  competitors: z.string().optional(),
  keywords: z.string().optional(),
});

type WatchlistForm = z.infer<typeof watchlistSchema>;

interface Watchlist {
  _id: string;
  name: string;
  description?: string;
  competitors: string[];
  keywords: string[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function WatchlistsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['watchlists'],
    queryFn: () => watchlistApi.getWatchlists(),
    select: (res) => (res.data.data || []) as Watchlist[],
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WatchlistForm>({
    resolver: zodResolver(watchlistSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => watchlistApi.createWatchlist(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlists'] });
      setShowForm(false);
      reset();
      toast.success('Watchlist created');
    },
    onError: () => toast.error('Failed to create watchlist'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      watchlistApi.updateWatchlist(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlists'] });
      setEditingId(null);
      setShowForm(false);
      reset();
      toast.success('Watchlist updated');
    },
    onError: () => toast.error('Failed to update watchlist'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => watchlistApi.deleteWatchlist(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlists'] });
      toast.success('Watchlist deleted');
    },
    onError: () => toast.error('Failed to delete watchlist'),
  });

  const openCreate = () => {
    setEditingId(null);
    reset();
    setShowForm(true);
  };

  const openEdit = (wl: Watchlist) => {
    setEditingId(wl._id);
    setValue('name', wl.name);
    setValue('description', wl.description || '');
    setValue('competitors', wl.competitors.join(', '));
    setValue('keywords', wl.keywords.join(', '));
    setShowForm(true);
  };

  const onSubmit = (form: WatchlistForm) => {
    const payload = {
      name: form.name,
      description: form.description,
      competitors: form.competitors
        ? form.competitors.split(',').map((c) => c.trim()).filter(Boolean)
        : [],
      keywords: form.keywords
        ? form.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [],
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const totalItems = (data || []).reduce((sum, wl) => sum + (wl.keywords.length + wl.competitors.length), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6" /> Watchlists
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track competitors and keywords you care about most
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Watchlist
        </Button>
      </div>

      {/* Summary stats */}
      {!isLoading && (data || []).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{(data || []).length}</p>
                <p className="text-xs text-muted-foreground">Watchlists</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Tag className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-bold">{totalItems}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Tag className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xl font-bold">
                  {(data || []).reduce((sum, wl) => sum + wl.keywords.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Keywords Tracked</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editingId ? 'Edit Watchlist' : 'Create Watchlist'}
              </CardTitle>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); reset(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Name</label>
                  <Input {...register('name')} placeholder="e.g. AI Competitors" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Input {...register('description')} placeholder="Brief description..." />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Competitors (comma-separated)</label>
                  <Input
                    {...register('competitors')}
                    placeholder="e.g. OpenAI, Anthropic, Google DeepMind"
                  />
                  <p className="text-xs text-muted-foreground">Competitor names to track</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Keywords (comma-separated)</label>
                  <Input
                    {...register('keywords')}
                    placeholder="e.g. LLM, fine-tuning, RLHF"
                  />
                  <p className="text-xs text-muted-foreground">Keywords to monitor</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" loading={isSubmitting}>
                  {editingId ? 'Save Changes' : 'Create Watchlist'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingId(null); reset(); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Watchlist cards */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (data || []).length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Star className="w-10 h-10 text-muted-foreground" />
          <p className="font-medium">No watchlists yet</p>
          <p className="text-sm text-muted-foreground">
            Create watchlists to organize and track your market targets
          </p>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Create Watchlist
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(data || []).map((wl) => {
            const isExpanded = expandedId === wl._id;
            const itemCount = wl.keywords.length + wl.competitors.length;
            return (
              <Card key={wl._id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
                      <Star className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{wl.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      {wl.description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{wl.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {formatDate(wl.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : wl._id)}
                        className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        title="Show details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => openEdit(wl)}
                        className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(wl._id)}
                        className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {wl.competitors.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Competitors
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {wl.competitors.map((c) => (
                              <Badge key={c} variant="warning" className="text-xs">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {wl.keywords.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Keywords
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {wl.keywords.map((k) => (
                              <span key={k} className="text-xs bg-secondary px-2.5 py-1 rounded-full">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {wl.keywords.length === 0 && wl.competitors.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No items yet. Edit this watchlist to add competitors or keywords.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
