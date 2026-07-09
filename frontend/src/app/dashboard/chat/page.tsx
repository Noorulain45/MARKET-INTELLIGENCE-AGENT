'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import ChatInterface from '@/components/chat/ChatInterface';
import { chatApi } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Chat {
  _id: string;
  title: string;
  updatedAt: string;
}

export default function ChatPage() {
  const qc = useQueryClient();
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  const [activeMessages, setActiveMessages] = useState<unknown[]>([]);

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatApi.getChats(),
    select: (res) => res.data.data || [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chatApi.deleteChat(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chats'] });
      if (activeChatId) setActiveChatId(undefined);
      toast.success('Chat deleted');
    },
  });

  const loadChat = async (chatId: string) => {
    try {
      const { data } = await chatApi.getChatById(chatId);
      setActiveChatId(chatId);
      setActiveMessages(data.data.messages || []);
    } catch {
      toast.error('Failed to load chat');
    }
  };

  const startNew = () => {
    setActiveChatId(undefined);
    setActiveMessages([]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-3">
        <Button size="sm" className="gap-2" onClick={startNew}>
          <Plus className="w-4 h-4" /> New Chat
        </Button>

        <div className="flex-1 overflow-y-auto space-y-1">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)
          ) : (
            (chats || []).map((chat: Chat) => (
              <div
                key={chat._id}
                className={`group flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeChatId === chat._id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary'
                }`}
                onClick={() => loadChat(chat._id)}
              >
                <MessageCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(chat.updatedAt)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(chat._id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-4 h-full">
          <ChatInterface
            chatId={activeChatId}
            initialMessages={activeMessages as Parameters<typeof ChatInterface>[0]['initialMessages']}
            onChatCreated={(id) => {
              setActiveChatId(id);
              qc.invalidateQueries({ queryKey: ['chats'] });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
