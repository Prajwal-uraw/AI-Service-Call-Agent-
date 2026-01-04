'use client';

import Link from 'next/link';
import { Globe, MoreVertical, Power, Edit, Trash2, Key, Code } from 'lucide-react';
import { useState } from 'react';
import type { Website } from '@/lib/alertstream/types';

interface WebsiteCardProps {
  website: Website;
  onDelete?: (id: string) => void;
  onToggle?: (id: string) => void;
}

export default function WebsiteCard({ website, onDelete, onToggle }: WebsiteCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-sky-100 w-12 h-12 rounded-lg flex items-center justify-center">
            <Globe className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{website.name}</h3>
            <p className="text-sm text-gray-500">{website.domain}</p>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <Link
                href={`/alertstream/dashboard/websites/${website.id}`}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
              <button
                onClick={() => onToggle?.(website.id)}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
              >
                <Power className="h-4 w-4" />
                <span>{website.is_active ? 'Disable' : 'Enable'}</span>
              </button>
              <Link
                href={`/alertstream/dashboard/websites/${website.id}/keys`}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
              >
                <Key className="h-4 w-4" />
                <span>Rotate Keys</span>
              </Link>
              <Link
                href={`/alertstream/dashboard/websites/${website.id}/snippet`}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
              >
                <Code className="h-4 w-4" />
                <span>Get Snippet</span>
              </Link>
              <button
                onClick={() => onDelete?.(website.id)}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${website.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-gray-600">{website.is_active ? 'Active' : 'Inactive'}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">API Key: {website.api_key.slice(0, 12)}...</span>
        </div>
        <Link
          href={`/alertstream/dashboard/websites/${website.id}`}
          className="text-sky-500 hover:text-sky-600 text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
