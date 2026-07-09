'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell, Plus, Trash2, Edit2, CheckCircle, XCircle, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { alertsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const ALERT_TYPES = ['keyword', 'competitor', 'sentiment', 'trend', 'news'];
const FREQUENCIES = ['realtime', 'daily', 'weekly'];

const alertSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.string().min(1, 'Type is required'),
  keywords: z.string().min(1, 'At least one keyword required'),
  threshold: z.coerce.number().min(0).max(100),
  frequency: z.string().min(1, 'Frequency is required'),
});

type AlertForm = z.infer<typeof alertSchema>;

interface Alert {
  _id: string;
  name: string;
  type: string;
  keywords: string[];
  threshold: number;
  frequency: string;
  isActive: boolean;
  triggeredCount: number;
  lastTriggered?: string;
  createdAt: string;
}

const typeVariant: Record<string, 'info' | 'warning' | 'success' | 'secondary' | 'destructive'> = {
  keyword: 'info',
  competitor: 'warning',
  sentiment: 'secondary',
  trend: 'success',
  news: 'default' as 'secondary',
};

export default function AlertsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts(),
    select: (res) => (res.data.data || []) as Alert[],
  });

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<AlertForm>({
    resolver: zodResolver(alertSchema),
    defaultValues: { threshold: 50, frequency: 'daily', type: 'keyword' },
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => alertsApi.createAlert(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      setShowForm(false);
      reset();
      toast.success('Alert created');
    },
    onError: () => toast.error('Failed to create alert'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      alertsApi.updateAlert(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      setEditingAlert(null);
      setShowForm(false);
      reset();
      toast.success('Alert updated');
    },
    onError: () => toast.error('Failed to update alert'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => alertsApi.deleteAlert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert deleted');
    },
    onError: () => toast.error('Failed to delete alert'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      alertsApi.updateAlert(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
    onError: () => toast.error('Failed to toggle alert'),
  });

  const openCreate = () => {
    setEditingAlert(null);
    reset({ threshold: 50, frequency: 'daily', type: 'keyword' });
    setShowForm(true);
  };

  const openEdit = (alert: Alert) => {
    setEditingAlert(alert);
    setValue('name', alert.name);
    setValue('type', alert.type);
    setValue('keywords', alert.keywords.join(', '));
    setValue('threshold', alert.threshold);
    setValue('frequency', alert.frequency);
    setShowForm(true);
  };

  const onSubmit = async (form: AlertForm) => {
    const payload = {
      name: form.name,
      type: form.type,
      keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      threshold: form.threshold,
      frequency: form.frequency,
    };
    if (editingAlert) {
      updateMutation.mutate({ id: editingAlert._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" /> Alerts
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get notified when market conditions match your criteria
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Alert
        </Button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {editingAlert ? 'Edit Alert' : 'Create Alert'}
              </CardTitle>
              <button
                onClick={() => { setShowForm(false); setEditingAlert(null); reset(); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Alert Name</label>
                  <Input {...register('name')} placeholder="e.g. AI Competitor Mention" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Alert Type</label>
                  <select
                    {...register('type')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {ALERT_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-card capitalize">{t}</option>
                    ))}
                  </select>
                  {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
                </div>

                {/* Keywords */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium">Keywords</label>
                  <Input
                    {...register('keywords')}
                    placeholder="e.g. OpenAI, GPT-5, generative AI (comma-separated)"
                  />
                  {errors.keywords && <p className="text-xs text-destructive">{errors.keywords.message}</p>}
                </div>

                {/* Threshold */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Threshold (%)</label>
                  <Input {...register('threshold')} type="number" min={0} max={100} placeholder="50" />
                  {errors.threshold && <p className="text-xs text-destructive">{errors.threshold.message}</p>}
                </div>

                {/* Frequency */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Frequency</label>
                  <select
                    {...register('frequency')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f} value={f} className="bg-card capitalize">{f}</option>
                    ))}
                  </select>
                  {errors.frequency && <p className="text-xs text-destructive">{errors.frequency.message}</p>}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" loading={isSubmitting}>
                  {editingAlert ? 'Save Changes' : 'Create Alert'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingAlert(null); reset(); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats summary */}
      {!isLoading && data && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Alerts', value: data.length, icon: Bell },
            { label: 'Active', value: data.filter(a => a.isActive).length, icon: CheckCircle },
            { label: 'Inactive', value: data.filter(a => !a.isActive).length, icon: XCircle },
            { label: 'Triggered Today', value: data.filter(a => a.lastTriggered && new Date(a.lastTriggered).toDateString() === new Date().toDateString()).length, icon: Bell },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alerts list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (data || []).length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <Bell className="w-10 h-10 text-muted-foreground" />
          <p className="font-medium">No alerts configured</p>
          <p className="text-sm text-muted-foreground">
            Create your first alert to get notified of market changes
          </p>
          <Button size="sm" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Create Alert
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {(data || []).map((alert) => (
            <Card
              key={alert._id}
              className={`transition-colors ${alert.isActive ? 'hover:border-primary/30' : 'opacity-60'}`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-2 rounded-lg mt-0.5 ${alert.isActive ? 'bg-primary/10' : 'bg-secondary'}`}>
                  <Bell className={`w-4 h-4 ${alert.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{alert.name}</p>
                    <Badge variant={typeVariant[alert.type] || 'secondary'} className="text-xs capitalize">
                      {alert.type}
                    </Badge>
                    <Badge variant={alert.frequency === 'realtime' ? 'info' : 'secondary'} className="text-xs capitalize">
                      {alert.frequency}
                    </Badge>
                    {!alert.isActive && (
                      <Badge variant="secondary" className="text-xs">Paused</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {alert.keywords.slice(0, 4).map((kw) => (
                      <span key={kw} className="text-xs bg-secondary px-2 py-0.5 rounded-full">{kw}</span>
                    ))}
                    {alert.keywords.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{alert.keywords.length - 4} more</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                    <span>Threshold: {alert.threshold}%</span>
                    <span>Triggered: {alert.triggeredCount} times</span>
                    {alert.lastTriggered && (
                      <span>Last: {formatDate(alert.lastTriggered)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleMutation.mutate({ id: alert._id, isActive: !alert.isActive })}
                    className="p-1.5 rounded hover:bg-secondary transition-colors"
                    title={alert.isActive ? 'Pause alert' : 'Enable alert'}
                  >
                    {alert.isActive
                      ? <ToggleRight className="w-5 h-5 text-primary" />
                      : <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                    }
                  </button>
                  <button
                    onClick={() => openEdit(alert)}
                    className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(alert._id)}
                    className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
