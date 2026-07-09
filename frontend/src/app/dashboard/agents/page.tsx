'use client';

import { useState } from 'react';
import { Brain, Newspaper, Users, TrendingUp, MessageCircle, Star, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { agentsApi } from '@/lib/api';
import toast from 'react-hot-toast';

const agents = [
  {
    id: 'news',
    icon: Newspaper,
    title: 'News Agent',
    description: 'Analyzes recent news articles for market intelligence and emerging patterns.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    id: 'competitor',
    icon: Users,
    title: 'Competitor Agent',
    description: 'Tracks competitor activities, identifies threats and strategic opportunities.',
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
  },
  {
    id: 'trend',
    icon: TrendingUp,
    title: 'Trend Agent',
    description: 'Identifies rising market trends and predicts future developments.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    id: 'sentiment',
    icon: MessageCircle,
    title: 'Sentiment Agent',
    description: 'Analyzes customer feedback, pain points, and feature requests.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    id: 'recommendation',
    icon: Star,
    title: 'Strategy Agent',
    description: 'Generates actionable strategic recommendations based on all intelligence.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
];

interface AgentResult {
  result: string;
  agentType: string;
  timestamp: string;
}

export default function AgentsPage() {
  const [results, setResults] = useState<Record<string, AgentResult>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [fullResult, setFullResult] = useState<{ finalInsight?: string; news?: string; competitor?: string; trend?: string; sentiment?: string; recommendation?: string } | null>(null);
  const [fullLoading, setFullLoading] = useState(false);

  const runAgent = async (agentId: string) => {
    setLoading(prev => ({ ...prev, [agentId]: true }));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" /> AI Agents
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Specialized AI agents for market intelligence
          </p>
        </div>
        <Button onClick={runFull} disabled={fullLoading} className="gap-2">
          {fullLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          Run All Agents
        </Button>
      </div>

      {/* Full result */}
      {(fullLoading || fullResult) && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-slow" />
              Executive Intelligence Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fullLoading ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Running all agents in parallel...
              </div>
            ) : fullResult?.finalInsight ? (
              <div className="ai-prose text-sm text-muted-foreground leading-relaxed">
                {fullResult.finalInsight}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Individual agents */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const result = results[agent.id];
          const isLoading = loading[agent.id];
          return (
            <Card key={agent.id} className="hover:border-primary/30 transition-colors flex flex-col">
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg ${agent.bg} flex items-center justify-center mb-2`}>
                  <agent.icon className={`w-5 h-5 ${agent.color}`} />
                </div>
                <CardTitle className="text-base">{agent.title}</CardTitle>
                <CardDescription className="text-xs">{agent.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                {result && (
                  <div className="flex-1 bg-secondary rounded-lg p-3 text-xs text-muted-foreground leading-relaxed max-h-40 overflow-y-auto ai-prose">
                    {result.result}
                  </div>
                )}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-lg p-3">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing data...
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto">
                  {result ? (
                    <Badge variant="success" className="text-xs">Completed</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Idle</Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1"
                    onClick={() => runAgent(agent.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
