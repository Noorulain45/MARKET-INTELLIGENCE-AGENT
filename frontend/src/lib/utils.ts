import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  return format(new Date(date), fmt);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function sentimentColor(label: string): string {
  switch (label) {
    case 'positive': return 'text-emerald-400';
    case 'negative': return 'text-red-400';
    default: return 'text-yellow-400';
  }
}

export function importanceColor(importance: string): string {
  switch (importance) {
    case 'high': return 'text-red-400 bg-red-400/10';
    case 'medium': return 'text-yellow-400 bg-yellow-400/10';
    default: return 'text-slate-400 bg-slate-400/10';
  }
}

export function trendColor(direction: string): string {
  switch (direction) {
    case 'rising': return 'text-emerald-400';
    case 'falling': return 'text-red-400';
    default: return 'text-slate-400';
  }
}

export function truncate(str: string, length = 120): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
