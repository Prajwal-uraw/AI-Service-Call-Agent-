import { BookOpen } from 'lucide-react';

interface Source {
  id: number;
  citation: string;
  url?: string;
}

interface SourcesProps {
  sources: Source[];
}

export default function Sources({ sources }: SourcesProps) {
  return (
    <section className="bg-slate-50 border-t border-slate-200 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-neutral-900">Sources & References</h2>
          </div>
          <div className="space-y-3">
            {sources.map((source) => (
              <div key={source.id} className="flex gap-3 text-sm">
                <span className="font-semibold text-neutral-600 min-w-[2rem]">[{source.id}]</span>
                {source.url ? (
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-700 hover:text-blue-600 transition-colors"
                  >
                    {source.citation}
                  </a>
                ) : (
                  <span className="text-neutral-700">{source.citation}</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-300">
            <p className="text-xs text-neutral-600">
              All statistics are based on verified industry data, customer case studies, and internal performance metrics. 
              Calculations show methodology transparently. Customer data is anonymized or used with explicit permission.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
