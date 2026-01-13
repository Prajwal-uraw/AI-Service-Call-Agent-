import { NextRequest, NextResponse } from 'next/server';

// Share state with /conversation/route.ts
const globalAny = global as any;
if (!globalAny.conversations) {
  globalAny.conversations = [
    { id: '1', name: 'Sales Team' },
    { id: '2', name: 'Support Team' },
    { id: '3', name: 'Management' },
  ];
  globalAny.messagesByConversation = {
    '1': [
      { id: 1, sender: 'user', content: 'Hey sales team!', createdAt: new Date().toISOString() },
      { id: 2, sender: 'ai', content: 'Welcome to the sales chat.', createdAt: new Date().toISOString() },
    ],
    '2': [
      { id: 3, sender: 'user', content: 'Support needed.', createdAt: new Date().toISOString() },
      { id: 4, sender: 'ai', content: 'How can we help?', createdAt: new Date().toISOString() },
    ],
    '3': [
      { id: 5, sender: 'user', content: 'Management update.', createdAt: new Date().toISOString() },
      { id: 6, sender: 'ai', content: 'Thanks for the update.', createdAt: new Date().toISOString() },
    ],
  };
}
const conversations = globalAny.conversations;
const messagesByConversation: Record<string, any[]> = globalAny.messagesByConversation;


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('conversationId');
  if (searchParams.get('conversations') === 'list') {
    return NextResponse.json(conversations);
  }
  if (!conversationId || !messagesByConversation[conversationId]) {
    return NextResponse.json([]);
  }
  return NextResponse.json(messagesByConversation[conversationId]);
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  // Add message to conversation
  const body = await req.json();
  const { conversationId, content } = body;
  if (!conversationId || !messagesByConversation[conversationId]) {
    return NextResponse.json({ error: 'Invalid conversationId' }, { status: 400 });
  }
  const message = {
    id: Date.now(),
    sender: 'user',
    content,
    createdAt: new Date().toISOString(),
  };
  messagesByConversation[conversationId].push(message);
  // Simulate team/AI response
  setTimeout(() => {
    messagesByConversation[conversationId].push({
      id: Date.now() + 1,
      sender: 'ai',
      content: 'Team received your message.',
      createdAt: new Date().toISOString(),
    });
  }, 1000);
  return NextResponse.json(message);
}

