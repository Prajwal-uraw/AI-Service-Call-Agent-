'use client';

import { Check, X } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  kestrel: boolean | string;
  competitor: boolean | string;
}

interface ComparisonTableProps {
  title?: string;
  competitorName: string;
  rows: ComparisonRow[];
}

export default function ComparisonTable({
  title = 'Feature Comparison',
  competitorName,
  rows
}: ComparisonTableProps) {
  const renderCell = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-6 h-6 text-green-600 mx-auto" />
      ) : (
        <X className="w-6 h-6 text-red-400 mx-auto" />
      );
    }
    return <span className="text-neutral-700">{value}</span>;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 shadow-lg">
      {title && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200">
              <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Feature</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">Kestrel AI</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-neutral-600">{competitorName}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-neutral-900">{row.feature}</td>
                <td className="px-6 py-4 text-center text-sm">{renderCell(row.kestrel)}</td>
                <td className="px-6 py-4 text-center text-sm">{renderCell(row.competitor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
