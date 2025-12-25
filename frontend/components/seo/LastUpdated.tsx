import { Calendar } from 'lucide-react';

interface LastUpdatedProps {
  date: string;
  readingTime?: string;
}

export default function LastUpdated({ date, readingTime }: LastUpdatedProps) {
  return (
    <div className="flex items-center gap-4 text-sm text-neutral-600 mb-6 pb-6 border-b border-neutral-200">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>Last Updated: {date}</span>
      </div>
      {readingTime && (
        <>
          <span className="text-neutral-300">•</span>
          <span>{readingTime} min read</span>
        </>
      )}
    </div>
  );
}
