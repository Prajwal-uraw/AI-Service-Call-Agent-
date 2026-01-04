'use client';

import { 
  Phone, 
  Calendar, 
  MessageSquare, 
  Clock, 
  Users, 
  TrendingUp,
  CheckCircle,
  Wrench,
  Droplet,
  Zap,
  Scale,
  Stethoscope,
  Home
} from 'lucide-react';

export default function UseCasesSection() {
  const useCases = [
    {
      icon: Wrench,
      industry: "HVAC & Home Services",
      title: "24/7 Emergency Response",
      description: "Never miss an emergency call. AI agent qualifies urgency, schedules technicians, and provides instant quotes.",
      benefits: [
        "Capture every after-hours emergency",
        "Instant appointment scheduling",
        "Automated service area verification"
      ],
      stats: { metric: "95%", label: "Call capture rate" }
    },
    {
      icon: Droplet,
      industry: "Plumbing Services",
      title: "Leak & Emergency Triage",
      description: "AI identifies emergency vs. routine calls, dispatches plumbers instantly, and provides pricing estimates.",
      benefits: [
        "Emergency prioritization",
        "Real-time technician dispatch",
        "Transparent pricing upfront"
      ],
      stats: { metric: "3x", label: "Faster response time" }
    },
    {
      icon: Scale,
      industry: "Legal Services",
      title: "Client Intake & Qualification",
      description: "Screen potential clients, gather case details, schedule consultations, and maintain HIPAA compliance.",
      benefits: [
        "Automated intake forms",
        "Case type qualification",
        "Secure information handling"
      ],
      stats: { metric: "70%", label: "Admin time saved" }
    },
    {
      icon: Stethoscope,
      industry: "Medical & Dental",
      title: "Appointment Management",
      description: "HIPAA-compliant patient scheduling, insurance verification, and appointment reminders.",
      benefits: [
        "HIPAA-compliant conversations",
        "Insurance pre-verification",
        "Automated appointment reminders"
      ],
      stats: { metric: "40%", label: "No-show reduction" }
    },
    {
      icon: Home,
      industry: "Real Estate",
      title: "Property Inquiry Handling",
      description: "Qualify buyers, schedule showings, answer property questions, and capture lead information.",
      benefits: [
        "24/7 property information",
        "Instant showing scheduling",
        "Lead qualification & scoring"
      ],
      stats: { metric: "5x", label: "More qualified leads" }
    },
    {
      icon: Zap,
      industry: "Electrical Services",
      title: "Safety-First Dispatch",
      description: "Identify electrical emergencies, provide safety guidance, and dispatch electricians immediately.",
      benefits: [
        "Emergency safety protocols",
        "Instant technician routing",
        "Service history tracking"
      ],
      stats: { metric: "100%", label: "Emergency coverage" }
    }
  ];

  const features = [
    {
      icon: Phone,
      title: "Intelligent Call Routing",
      description: "AI understands intent and routes to the right department or person instantly."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Syncs with your calendar to book appointments without double-booking."
    },
    {
      icon: MessageSquare,
      title: "Natural Conversations",
      description: "Customers can't tell they're talking to AI. Natural, human-like responses."
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Never miss a call, even at 3 AM. Your AI agent never sleeps."
    },
    {
      icon: Users,
      title: "Lead Qualification",
      description: "Automatically scores and qualifies leads based on your criteria."
    },
    {
      icon: TrendingUp,
      title: "Revenue Optimization",
      description: "Captures more opportunities and converts more calls into bookings."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for <span className="text-blue-600">Every Service Industry</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From HVAC to healthcare, our AI voice agent adapts to your industry's unique needs.
            See how businesses like yours are using Kestrel.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {useCases.map((useCase, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <useCase.icon className="text-blue-600" size={24} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{useCase.stats.metric}</div>
                  <div className="text-xs text-gray-500">{useCase.stats.label}</div>
                </div>
              </div>
              
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
                {useCase.industry}
              </div>
              <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
              <p className="text-gray-600 mb-4 text-sm">{useCase.description}</p>
              
              <ul className="space-y-2">
                {useCase.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features That Drive Results
            </h3>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Everything you need to automate your phone operations and never miss an opportunity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all"
              >
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon size={24} />
                </div>
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-blue-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold mb-8">Why Service Businesses Choose Kestrel</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">200ms</div>
              <div className="text-sm text-gray-600">Average response time</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Uptime guarantee</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">48hrs</div>
              <div className="text-sm text-gray-600">Time to go live</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">Always available</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
