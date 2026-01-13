import { useEffect } from 'react';

export function MeetingToast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(onClose, 3000);
    return () => clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="fixed top-6 right-6 z-50 px-6 py-3 bg-blue-700 text-white rounded-lg shadow-lg animate-fade-in">
      {message}
    </div>
  );
}
