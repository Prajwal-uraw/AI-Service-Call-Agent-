'use client';

import { Phone, Calendar, MessageSquare, BarChart3, Clock, Zap, Shield, Users } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: Phone,
      title: "Autonomous Intake & Qualification",
      description: "Automate structured collection, booking, and routing according to your operational rules. Sub-200ms response ensures zero call abandonment.",
      color: "blue"
    },
    {
      icon: Calendar,
      title: "Deterministic Workflows",
      description: "Deploy repeatable, verifiable voice workflows that force consistent outcomes and reduce variance across all call types.",
      color: "green"
    },
    {
      icon: MessageSquare,
      title: "Outcome-Anchored Routing",
      description: "Prioritize escalation, human fallback, or booking based on rules you control. Every call reaches the right resolution path.",
      color: "purple"
    },
    {
      icon: BarChart3,
      title: "Operational Telemetry",
      description: "Track and measure key voice ops metrics: resolution rate, escalation load, revenue impact. Full audit trail for every interaction.",
      color: "amber"
    },
    {
      icon: Clock,
      title: "Enterprise-Grade Availability",
      description: "99.9% uptime SLA with multi-region redundancy. Zero downtime deployments ensure continuous operations.",
      color: "indigo"
    },
    {
      icon: Zap,
      title: "Workflow Orchestration",
      description: "Trigger downstream actions across CRM, scheduling, and notification systems. Fully programmable post-call automation.",
      color: "orange"
    },
    {
      icon: Shield,
      title: "Compliance & Security",
      description: "SOC 2 Type II certified, HIPAA compliant. End-to-end encryption with complete data sovereignty controls.",
      color: "red"
    },
    {
      icon: Users,
      title: "Platform Integration",
      description: "Native connectors for ServiceTitan, Housecall Pro, Jobber. RESTful API for custom integrations and data pipelines.",
      color: "teal"
    }
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600"
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-4">
            <span className="text-sm font-medium text-blue-900">Everything you need</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Voice Operations Infrastructure
          </h2>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
            Platform capabilities that deliver deterministic, verifiable workflows at scale
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a 
            href="/calendar"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Request Workflow Validation
          </a>
        </div>
      </div>
    </section>
  );
}
