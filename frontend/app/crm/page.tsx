'use client';

import Link from 'next/link';
import { Briefcase, Kanban, ListChecks, Users, ArrowRight } from 'lucide-react';

export default function CrmHomePage() {
  const cards = [
    {
      title: 'Leads',
      description: 'Review inbound leads and prioritize follow-ups.',
      href: '/crm/leads',
      icon: Briefcase,
    },
    {
      title: 'Pipeline',
      description: 'Drag and drop leads between stages.',
      href: '/crm/pipeline',
      icon: Kanban,
    },
    {
      title: 'Tasks',
      description: 'Stay on top of follow-ups and reminders.',
      href: '/crm/tasks',
      icon: ListChecks,
    },
    {
      title: 'Contacts',
      description: 'Manage your contact database.',
      href: '/crm/contacts',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">CRM</h1>
        <p className="text-slate-400 mt-2">A single workspace for leads, pipeline, and follow-ups.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg hover:bg-slate-800/60 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-slate-900/30 backdrop-blur-md rounded-xl border border-white/5 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-300" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-100">{card.title}</h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{card.description}</p>
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Quick Start</h2>
        <p className="text-sm text-slate-400 mb-4">
          Start in <span className="text-slate-200">Leads</span>, then move qualified opportunities through the pipeline.
        </p>
        <Link
          href="/crm/leads"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Open Leads
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
