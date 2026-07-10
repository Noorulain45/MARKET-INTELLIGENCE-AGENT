'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatRelativeTime } from '@/lib/utils';
import { chatApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{ title: string; url: string; type: string }>;
}

interface ChatInterfaceProps {
  chatId?: string;
  initialMessages?: Message[];
  onChatCreated?: (chatId: string) => void;
}

export default function ChatInterface({ chatId, initialMessages = [], onChatCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data } = await chatApi.sendMessage(text, currentChatId);
      const { chatId: newChatId, message } = data.data;

      if (!currentChatId && newChatId) {
        setCurrentChatId(newChatId);
        onChatCreated?.(newChatId);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: message.content,
        timestamp: new Date(message.timestamp),
        sources: message.sources,
      }]);
    } catch (err) {
      toast.error('Failed to send message');
      setMessages(prev => prev.slice(0, -1));
      setInput(text);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are the top market trends this week?",
    "Analyze our main competitors",
    "What's the customer sentiment like?",
    "Generate strategic recommendations",
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Market Intelligence AI</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ask me anything about market trends, competitors, or get strategic insights.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left text-xs p-3 rounded-lg border border-border hover:bg-secondary hover:border-primary/30 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
              msg.role === 'user' ? 'bg-primary' : 'bg-secondary'
            )}>
              {msg.role === 'user'
                ? <User className="w-3.5 h-3.5 text-white" />
                : <Bot className="w-3.5 h-3.5 text-primary" />
              }
            </div>
            <div className={cn('max-w-[80%] space-y-2', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn(
                'rounded-xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary'
              )}>
                <div className="ai-prose whitespace-pre-wrap">{msg.content}</div>
              </div>
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.sources.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary bg-secondary px-2 py-1 rounded-md transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {s.title || s.type}
                    </a>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground px-1">
                {formatRelativeTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-secondary rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Analyzing market data...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 pt-4 border-t border-border">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Ask about market trends, competitors, sentiment..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
