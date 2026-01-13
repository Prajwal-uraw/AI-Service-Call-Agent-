import { NextRequest, NextResponse } from 'next/server';

// Use the same in-memory store as messages/route.ts
const globalAny = global as any;
if (!globalAny.conversations) {
  globalAny.conversations = [
    { id: '1', name: 'Sales Team' },
    { id: '2', name: 'Support Team' },
    { id: '3', name: 'Management' },
  ];
  globalAny.messagesByConversation = {
    '1': [],
    '2': [],
    '3': [],
  };
}
const conversations = globalAny.conversations;
const messagesByConversation = globalAny.messagesByConversation;

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const newId = (Math.max(0, ...conversations.map((c: any) => Number(c.id))) + 1).toString();
  const newConv = { id: newId, name };
  conversations.push(newConv);
  messagesByConversation[newId] = [];
  return NextResponse.json(newConv);
}
