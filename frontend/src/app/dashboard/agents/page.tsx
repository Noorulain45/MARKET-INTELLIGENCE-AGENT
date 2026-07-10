'use client';

import React, { useState } from 'react';
import {
  Brain,
  Newspaper,
  Users,
  TrendingUp,
  MessageCircle,
  Star,
  Play,
  Loader2,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { agentsApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const agents = [
  {
    id: 'news',
    icon: Newspaper,
    title: 'News Agent',
    description: 'Analyzes recent news articles for market intelligence and emerging patterns.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    glow: 'shadow-[0_0_12px_hsl(217_91%_60%/0.25)]',
  },
  {
    id: 'competitor',
    icon: Users,
    title: 'Competitor Agent',
    description: 'Tracks competitor activities, identifies threats and strategic opportunities.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/30',
    glow: 'shadow-[0_0_12px_hsl(263_70%_60%/0.25)]',
  },
  {
    id: 'trend',
    icon: TrendingUp,
    title: 'Trend Agent',
    description: 'Identifies rising market trends and predicts future developments.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    glow: 'shadow-[0_0_12px_hsl(152_76%_50%/0.25)]',
  },
  {
    id: 'sentiment',
    icon: MessageCircle,
    title: 'Sentiment Agent',
    description: 'Analyzes customer feedback, pain points, and feature requests.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    glow: 'shadow-[0_0_12px_hsl(47_96%_53%/0.25)]',
  },
  {
    id: 'recommendation',
    icon: Star,
    title: 'Strategy Agent',
    description: 'Generates actionable strategic recommendations based on all intelligence.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    glow: 'shadow-[0_0_12px_hsl(24_95%_53%/0.25)]',
  },
];

interface AgentResult {
  result: string;
  agentType: string;
  timestamp: string;
}

type FullResult = {
  finalInsight?: string;
  news?: string;
  competitor?: string;
  trend?: string;
  sentiment?: string;
  recommendation?: string;
};

const FULL_ID = '__full__';

export default function AgentsPage() {
  const [results, setResults] = useState<Record<string, AgentResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [fullResult, setFullResult] = useState<FullResult | null>(null);
  const [fullLoading, setFullLoading] = useState(false);
  const [selected, setSelected] = useState<string>(agents[0].id);

  const runAgent = async (agentId: string) => {
    setLoading(prev => ({ ...prev, [agentId]: true }));
    // Auto-select the running agent so user sees output immediately
    setSelected(agentId);
    try {
      const { data } = await agentsApi.runAgent(agentId);
      setResults(prev => ({ ...prev, [agentId]: data.data }));
      toast.success(`${agentId} agent completed`);
    } catch {
      toast.error(`Failed to run ${agentId} agent`);
    } finally {
      setLoading(prev => ({ ...prev, [agentId]: false }));
    }
  };

  const runFull = async () => {
    setFullLoading(true);
    setFullResult(null);
    setSelected(FULL_ID);
    try {
      const { data } = await agentsApi.runFull('Generate comprehensive market intelligence briefing');
      setFullResult(data.data);
      toast.success('Full analysis complete');
    } catch {
      toast.error('Full analysis failed');
    } finally {
      setFullLoading(false);
    }
  };

  // Derive what to show in the right panel
  const selectedAgent = agents.find(a => a.id === selected);
  const selectedResult = selected !== FULL_ID ? results[selected] : null;
  const isSelectedLoading = selected !== FULL_ID ? !!loading[selected] : fullLoading;

  return (
    <div className="flex flex-col h-full gap-0">
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary drop-shadow-pink" />
            AI Agents
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Specialized AI agents for market intelligence
          </p>
        </div>
        <Button
          onClick={runFull}
          disabled={fullLoading}
          className="gap-2 glitter"
        >
          {fullLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Sparkles className="w-4 h-4" />}
          Run All Agents
        </Button>
      </div>

      {/* ── Two-column split ──────────────────────────────────────── */}
      <div className="flex gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 12rem)' }}>

        {/* LEFT — Agent list */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">

          {/* "All Agents" card */}
          <button
            onClick={() => { setSelected(FULL_ID); }}
            className={cn(
              'w-full text-left rounded-xl border p-3 transition-all duration-200',
              'bg-card hover:border-primary/40 hover:shadow-pink-glow',
              selected === FULL_ID
                ? 'border-primary/60 shadow-pink-glow nav-active-glow'
                : 'border-border'
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Executive Report</p>
                <p className="text-xs text-muted-foreground truncate">All agents combined</p>
              </div>
              {fullResult && (
                <Badge variant="success" className="text-[10px] flex-shrink-0">Done</Badge>
              )}
              {fullLoading && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary flex-shrink-0" />
              )}
            </div>
          </button>

          {/* Individual agent cards */}
          {agents.map((agent) => {
            const result = results[agent.id];
            const isLoading = loading[agent.id];
            const isActive = selected === agent.id;

            return (
              <button
                key={agent.id}
                onClick={() => setSelected(agent.id)}
                className={cn(
                  'w-full text-left rounded-xl border p-3 transition-all duration-200 group',
                  'bg-card',
                  isActive
                    ? `${agent.border} ${agent.glow} nav-active-glow`
                    : 'border-border hover:border-primary/30 hover:shadow-pink-glow'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', agent.bg)}>
                    <agent.icon className={cn('w-4 h-4', agent.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{agent.title}</p>
                    <p className="text-xs text-muted-foreground truncate leading-snug">
                      {agent.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {isLoading ? (
                      <Loader2 className={cn('w-3.5 h-3.5 animate-spin', agent.color)} />
                    ) : result ? (
                      <Badge variant="success" className="text-[10px]">Done</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Idle</Badge>
                    )}
                    <ChevronRight className={cn(
                      'w-3.5 h-3.5 transition-colors',
                      isActive ? agent.color : 'text-muted-foreground/40'
                    )} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT — Result panel */}
        <div className="flex-1 min-w-0 flex flex-col">
          {selected === FULL_ID ? (
            /* ── Full / Executive report panel ── */
            <Card className="flex-1 flex flex-col border-primary/30 overflow-hidden">
              <CardHeader className="pb-3 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
                    <CardTitle className="text-base">Executive Intelligence Report</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={runFull}
                    disabled={fullLoading}
                  >
                    {fullLoading
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <RefreshCw className="w-3 h-3" />}
                    {fullLoading ? 'Running...' : 'Regenerate'}
                  </Button>
                </div>
                <CardDescription className="text-xs">
                  Synthesized output from all five intelligence agents
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pt-4">
                {fullLoading && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground py-8 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    Running all agents in parallel...
                  </div>
                )}
                {!fullLoading && !fullResult && (
                  <EmptyState
                    icon={<Sparkles className="w-8 h-8 text-primary/50" />}
                    title="No report yet"
                    description='Click "Run All Agents" to generate a comprehensive market intelligence briefing.'
                    action={
                      <Button size="sm" onClick={runFull} className="gap-1.5 glitter">
                        <Sparkles className="w-3.5 h-3.5" /> Run All Agents
                      </Button>
                    }
                  />
                )}
                {!fullLoading && fullResult?.finalInsight && (
                  <ProseResult text={fullResult.finalInsight} />
                )}
              </CardContent>
            </Card>
          ) : selectedAgent ? (
            /* ── Individual agent result panel ── */
            <Card className={cn('flex-1 flex flex-col overflow-hidden', selectedAgent.border)}>
              <CardHeader className="pb-3 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', selectedAgent.bg)}>
                      <selectedAgent.icon className={cn('w-5 h-5', selectedAgent.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{selectedAgent.title}</CardTitle>
                      <CardDescription className="text-xs">{selectedAgent.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedResult && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(selectedResult.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                    {selectedResult || isSelectedLoading ? (
                      /* Regenerate — only show if there's an existing result or it ran before */
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => runAgent(selectedAgent.id)}
                        disabled={isSelectedLoading}
                      >
                        {isSelectedLoading
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <RefreshCw className="w-3 h-3" />}
                        {isSelectedLoading ? 'Running...' : 'Regenerate'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs glitter"
                        onClick={() => runAgent(selectedAgent.id)}
                        disabled={isSelectedLoading}
                      >
                        {isSelectedLoading
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Play className="w-3 h-3" />}
                        Run Agent
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto pt-4">
                {isSelectedLoading && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground py-8 justify-center">
                    <Loader2 className={cn('w-5 h-5 animate-spin', selectedAgent.color)} />
                    Analyzing data...
                  </div>
                )}
                {!isSelectedLoading && !selectedResult && (
                  <EmptyState
                    icon={<selectedAgent.icon className={cn('w-8 h-8', selectedAgent.color, 'opacity-50')} />}
                    title="Agent hasn't run yet"
                    description={`Run the ${selectedAgent.title} to see its analysis here.`}
                    action={
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => runAgent(selectedAgent.id)}
                      >
                        <Play className="w-3.5 h-3.5" /> Run Agent
                      </Button>
                    }
                  />
                )}
                {!isSelectedLoading && selectedResult && (
                  <ProseResult text={selectedResult.result} />
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ── Prose renderer — parses plain text into structured paragraphs ── */
function ProseResult({ text }: { text: string }) {
  // Split on double-newlines (paragraphs) or single newlines
  const blocks = text.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="ai-prose text-sm text-muted-foreground">
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        // Markdown-style heading: ## Heading or **Heading**
        if (/^#{1,3}\s/.test(trimmed)) {
          const level = (trimmed.match(/^(#+)/)?.[1].length ?? 1);
          const content = trimmed.replace(/^#+\s*/, '');
          if (level === 1) return <h1 key={i}>{content}</h1>;
          if (level === 2) return <h2 key={i}>{content}</h2>;
          return <h3 key={i}>{content}</h3>;
        }

        // Bold standalone line as h3 (e.g. **Section Title**)
        if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
          return <h3 key={i}>{trimmed.replace(/\*\*/g, '')}</h3>;
        }

        // Bullet list block
        if (/^[-•*]\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter(l => /^[-•*]\s/.test(l.trim()));
          return (
            <ul key={i}>
              {items.map((item, j) => (
                <li key={j}>{inlineFormat(item.replace(/^[-•*]\s*/, '').trim())}</li>
              ))}
            </ul>
          );
        }

        // Numbered list block
        if (/^\d+[.)]\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter(l => /^\d+[.)]\s/.test(l.trim()));
          return (
            <ol key={i}>
              {items.map((item, j) => (
                <li key={j}>{inlineFormat(item.replace(/^\d+[.)]\s*/, '').trim())}</li>
              ))}
            </ol>
          );
        }

        // Horizontal rule
        if (/^[-_*]{3,}$/.test(trimmed)) {
          return <hr key={i} />;
        }

        // Default paragraph
        return <p key={i}>{inlineFormat(trimmed)}</p>;
      })}
    </div>
  );
}

/** Converts **bold** and *italic* inline markers to React elements */
function inlineFormat(text: string): React.ReactNode {
  // Split on **bold** and *italic* tokens
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (/^\*[^*]+\*$/.test(part)) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

/* ── Small helper component ───────────────────────────────────────── */
function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon}
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
      {action}
    </div>
  );
}
