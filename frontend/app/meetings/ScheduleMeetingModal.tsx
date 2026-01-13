import { useState } from 'react';

export function ScheduleMeetingModal({ open, onClose, onSchedule }: { open: boolean, onClose: () => void, onSchedule: (title: string) => void }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[320px]">
        <h2 className="text-lg font-semibold mb-4">Schedule Meeting</h2>
        <form onSubmit={e => {
          e.preventDefault();
          if (!title.trim()) {
            setError('Meeting title is required');
            return;
          }
          onSchedule(title.trim());
          setTitle('');
          setError('');
        }}>
          <input
            type="text"
            placeholder="Meeting title"
            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={title}
            onChange={e => { setTitle(e.target.value); setError(''); }}
            autoFocus
          />
          {error && <div className="text-xs text-red-500 mt-2">{error}</div>}
          <div className="flex justify-end mt-6 gap-2">
            <button type="button" className="px-4 py-2 text-neutral-500 hover:text-neutral-900" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}
