'use client';

import AdminLayout from '@/components/AdminLayout';
import { MessageSquare, Send, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageComponent, Message } from './MessageComponent';
import { useWebSocket } from './useWebSocket';
import { NewConversationForm } from './NewConversationForm';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<{ id: string; name: string }[]>([]);
  const [selectedId, setSelectedId] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    fetch('/api/messages?conversations=list')
      .then((res) => res.json())
      .then(setConversations)
      .catch(() => setConversations([]));
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async () => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/messages?conversationId=${selectedId}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch {
      setMessages([]);
    }
  }, [selectedId]);

  useEffect(() => {
    if (user && selectedId) fetchMessages();
  }, [user, selectedId, fetchMessages]);

  // WebSocket for real-time updates (optional: can be extended for team)
  useWebSocket({
    onMessage: (message: Message) => {
      setMessages((prev) => [...prev, message]);
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auth protection
  if (loading) return <div className="flex justify-center items-center h-full"><span>Loading...</span></div>;
  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  // Send message handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedId) return;
    const optimistic: Message = {
      id: Date.now(),
      sender: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setSending(true);
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedId, content: optimistic.content }),
      });
    } catch {}
    setSending(false);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-neutral-900">AI Messages</h1>
          {!showNewConv ? (
            <button
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              onClick={() => setShowNewConv(true)}
            >
              <Plus className="w-4 h-4" />
              New Message
            </button>
          ) : (
            <div className="w-96">
              <NewConversationForm
                onCreate={async (name) => {
                  // Persist to backend
                  const res = await fetch('/api/messages/conversation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }),
                  });
                  if (!res.ok) return;
                  const newConv = await res.json();
                  setConversations(prev => [...prev.filter(c => c.id !== newConv.id), newConv]);
                  setSelectedId(newConv.id);
                  setMessages([]);
                  setShowNewConv(false);
                }}
                onCancel={() => setShowNewConv(false)}
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-white border border-neutral-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-sm font-semibold text-neutral-900">Team Conversations</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {conversations.length === 0 ? (
                <div className="text-neutral-400 text-center p-8">No conversations</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-4 hover:bg-neutral-50 cursor-pointer ${selectedId === conv.id ? 'bg-neutral-100' : ''}`}
                    onClick={() => setSelectedId(conv.id)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-neutral-900">{conv.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="col-span-2 bg-white border border-neutral-200 rounded-lg flex flex-col">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-sm font-semibold text-neutral-900">
                {conversations.find((c) => c.id === selectedId)?.name || 'Conversation'}
              </h2>
            </div>
            <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: 400 }}>
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-sm text-neutral-600">No messages yet. Start the team chat!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageComponent key={message.id} message={message} />
                  ))}
                  <div ref={bottomRef} />
                </>
              )}
            </div>
            <form className="p-4 border-t border-neutral-200" onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a team message..."
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Send message"
                  disabled={sending || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

