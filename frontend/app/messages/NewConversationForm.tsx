import React, { useState } from 'react';

export function NewConversationForm({ onCreate, onCancel }: { onCreate: (name: string) => void, onCancel: () => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Conversation name is required');
      return;
    }
    onCreate(name.trim());
    setName('');
  };

  return (
    <form className="flex gap-2 items-center" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Conversation name"
        className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
        value={name}
        onChange={e => { setName(e.target.value); setError(''); }}
        autoFocus
      />
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Create</button>
      <button type="button" className="px-3 py-2 text-neutral-500 hover:text-neutral-900" onClick={onCancel}>Cancel</button>
      {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
    </form>
  );
}
