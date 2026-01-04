'use client';

import Link from 'next/link';
import { Zap, MoreVertical, Power, Edit, Trash2, TestTube } from 'lucide-react';
import { useState } from 'react';
import type { Trigger } from '@/lib/alertstream/types';
import { formatPhoneNumber } from '@/lib/alertstream/utils';

interface TriggerCardProps {
  trigger: Trigger;
  websiteName?: string;
  onDelete?: (id: string) => void;
  onToggle?: (id: string) => void;
  onTest?: (id: string) => void;
}

export default function TriggerCard({ trigger, websiteName, onDelete, onToggle, onTest }: TriggerCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            trigger.is_active ? 'bg-sky-100' : 'bg-gray-100'
          }`}>
            <Zap className={`h-6 w-6 ${trigger.is_active ? 'text-sky-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{trigger.name}</h3>
            {websiteName && <p className="text-sm text-gray-500">{websiteName}</p>}
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
                href={`/alertstream/dashboard/triggers/${trigger.id}`}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
              <button
                onClick={() => onToggle?.(trigger.id)}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
              >
                <Power className="h-4 w-4" />
                <span>{trigger.is_active ? 'Disable' : 'Enable'}</span>
              </button>
              <button
                onClick={() => onTest?.(trigger.id)}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
              >
                <TestTube className="h-4 w-4" />
                <span>Test Trigger</span>
              </button>
              <button
                onClick={() => onDelete?.(trigger.id)}
                className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Event Type:</span>
          <span className="font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
            {trigger.event_type}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Send to:</span>
          <span className="font-medium text-gray-900">{formatPhoneNumber(trigger.phone_number)}</span>
        </div>

        {trigger.conditions && trigger.conditions.length > 0 && (
          <div className="text-sm">
            <span className="text-gray-600">Conditions:</span>
            <div className="mt-1 space-y-1">
              {trigger.conditions.map((condition, idx) => (
                <div key={idx} className="bg-gray-50 px-3 py-1 rounded text-xs">
                  {condition.field} {condition.operator} {condition.value}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Message Template:</p>
          <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded italic">
            "{trigger.sms_template}"
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${trigger.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-600">{trigger.is_active ? 'Active' : 'Inactive'}</span>
          </div>
          <Link
            href={`/alertstream/dashboard/triggers/${trigger.id}`}
            className="text-sky-500 hover:text-sky-600 text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
