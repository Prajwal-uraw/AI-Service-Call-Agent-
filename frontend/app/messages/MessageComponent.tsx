import React from 'react';

export type Message = {
  id: string | number;
  sender: 'user' | 'ai';
  content: string;
  createdAt?: string;
};

export function MessageComponent({ message }: { message: Message }) {
  return (
    <div
      className={`message mb-2 flex ${
        message.sender === 'user'
          ? 'justify-end'
          : 'justify-start'
      }`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg shadow text-sm break-words ${
          message.sender === 'user'
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-neutral-100 text-neutral-900 rounded-bl-none'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
