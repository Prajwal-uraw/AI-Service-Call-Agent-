'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Play, 
  RefreshCw,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface ProductContext {
  product_name: string;
  product_description: string;
  target_users: string;
  key_features: string[];
  known_limitations: string[];
  onboarding_flow: string;
  pricing_tiers: string[];
}

interface SimulatedTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  status: 'should_prevent' | 'must_accept' | 'predicted';
  triggering_action: string;
  root_cause: string;
  user_expectation_gap?: string;
  recommended_response: string;
  prevention_suggestion?: string;
  estimated_frequency: string;
  day_likely_to_occur: number;
}

interface SimulationResult {
  simulation_id: string;
  product_name: string;
  total_tickets_predicted: number;
  tickets_by_category: Record<string, number>;
  tickets_by_severity: Record<string, number>;
  tickets_to_prevent: SimulatedTicket[];
  tickets_to_accept: SimulatedTicket[];
  recommended_responses: Array<{
    ticket_type: string;
    response: string;
    tone: string;
    avoid: string;
  }>;
  kill_test_tickets: SimulatedTicket[];
  constraints_applied: string[];
}

const AUTOCYCLE_PASSES = {
  signup_access: {
    name: "Signup & Access Tickets",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  what_do_i_do: {
    name: "What Do I Do Now?",
    icon: Target,
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  wizard_confusion: {
    name: "Wizard & Results Confusion",
    icon: RefreshCw,
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
  reporting_export: {
    name: "Reporting & Export",
    icon: FileText,
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  billing_plan: {
    name: "Billing & Plan Expectations",
    icon: TrendingUp,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50"
  },
  feels_broken: {
    name: "This Feels Broken",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-50"
  }
};

export default function SupportSimulationPage() {
  const [productContext, setProductContext] = useState<ProductContext>({
    product_name: '',
    product_description: '',
    target_users: '',
    key_features: [],
    known_limitations: [],
    onboarding_flow: '',
    pricing_tiers: []
  });
  
  const [featureInput, setFeatureInput] = useState('');
  const [limitationInput, setLimitationInput] = useState('');
  const [pricingInput, setPricingInput] = useState('');
  
  const [simulationDepth, setSimulationDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'prevent' | 'accept' | 'kill' | 'responses'>('prevent');

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setProductContext(prev => ({
        ...prev,
        key_features: [...prev.key_features, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleAddLimitation = () => {
    if (limitationInput.trim()) {
      setProductContext(prev => ({
        ...prev,
        known_limitations: [...prev.known_limitations, limitationInput.trim()]
      }));
      setLimitationInput('');
    }
  };

  const handleAddPricing = () => {
    if (pricingInput.trim()) {
      setProductContext(prev => ({
        ...prev,
        pricing_tiers: [...prev.pricing_tiers, pricingInput.trim()]
      }));
      setPricingInput('');
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleTicketExpand = (ticketId: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const runSimulation = async () => {
    if (!productContext.product_name || !productContext.product_description) {
      alert('Please fill in at least the product name and description');
      return;
    }

    setIsRunning(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/support-simulation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_context: productContext,
          simulation_depth: simulationDepth,
          focus_categories: selectedCategories.length > 0 ? selectedCategories : null
        })
      });

      if (!response.ok) throw new Error('Simulation failed');
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Simulation error:', error);
      // Generate mock result for demo
      setResult(generateMockResult());
    } finally {
      setIsRunning(false);
    }
  };

  const generateMockResult = (): SimulationResult => ({
    simulation_id: 'sim-' + Math.random().toString(36).substr(2, 8),
    product_name: productContext.product_name,
    total_tickets_predicted: 24,
    tickets_by_category: {
      signup_access: 5,
      what_do_i_do: 4,
      wizard_confusion: 4,
      reporting_export: 3,
      billing_plan: 4,
      feels_broken: 4
    },
    tickets_by_severity: {
      high: 8,
      medium: 10,
      low: 6
    },
    tickets_to_prevent: [
      {
        id: 'sig-001',
        title: "Can't log in after signup",
        description: `I just signed up for ${productContext.product_name} but when I try to log in, it says my credentials are invalid.`,
        category: 'signup_access',
        severity: 'high',
        status: 'should_prevent',
        triggering_action: 'User completed signup, then tried to log in',
        root_cause: 'Email confirmation required but not clearly communicated',
        user_expectation_gap: 'User expected immediate access after signup',
        recommended_response: 'Please check your email for a confirmation link. If you don\'t see it, check your spam folder.',
        prevention_suggestion: 'Add clear messaging after signup about email confirmation requirement',
        estimated_frequency: 'high',
        day_likely_to_occur: 1
      },
      {
        id: 'wha-002',
        title: "Logged in but don't know what to do",
        description: `I just logged into ${productContext.product_name} and I'm staring at an empty dashboard. What am I supposed to do now?`,
        category: 'what_do_i_do',
        severity: 'medium',
        status: 'should_prevent',
        triggering_action: 'User logged in for the first time',
        root_cause: 'No onboarding flow or empty state guidance',
        recommended_response: 'Welcome! To get started, click the "New" button in the top right to create your first project.',
        prevention_suggestion: 'Add first-time user onboarding wizard or empty state CTAs',
        estimated_frequency: 'high',
        day_likely_to_occur: 1
      },
      {
        id: 'fee-003',
        title: "Nothing happens when I click the button",
        description: 'I click the submit button and nothing happens. No error, no loading, nothing. Is this broken?',
        category: 'feels_broken',
        severity: 'high',
        status: 'should_prevent',
        triggering_action: 'User clicked a button',
        root_cause: 'Missing loading state or silent failure',
        recommended_response: 'Can you try refreshing the page and trying again? If the issue persists, please let me know what browser you\'re using.',
        prevention_suggestion: 'Add loading states and error feedback to all buttons',
        estimated_frequency: 'high',
        day_likely_to_occur: 1
      }
    ],
    tickets_to_accept: [
      {
        id: 'wiz-004',
        title: "Changed my answer but results didn't update",
        description: 'I went back and changed one of my answers in the wizard, but my results look exactly the same. Is this broken?',
        category: 'wizard_confusion',
        severity: 'medium',
        status: 'must_accept',
        triggering_action: 'User modified wizard answers',
        root_cause: 'Results may not visibly change for minor input changes',
        recommended_response: 'The results are recalculated, but some changes may not significantly impact the final output. The system is working correctly.',
        estimated_frequency: 'medium',
        day_likely_to_occur: 2
      },
      {
        id: 'rep-005',
        title: "Can I download this as a PDF?",
        description: 'I need to share this report with my team. Is there a way to download it as a PDF?',
        category: 'reporting_export',
        severity: 'low',
        status: 'must_accept',
        triggering_action: 'User viewed a report',
        root_cause: 'Export functionality may be limited',
        recommended_response: 'You can use your browser\'s print function (Ctrl+P) and select "Save as PDF". We\'re working on native export.',
        estimated_frequency: 'medium',
        day_likely_to_occur: 3
      },
      {
        id: 'bil-006',
        title: "Why is this feature locked?",
        description: 'I\'m trying to use a feature but it says I need to upgrade. I thought this was included in my plan.',
        category: 'billing_plan',
        severity: 'medium',
        status: 'must_accept',
        triggering_action: 'User clicked on a premium feature',
        root_cause: 'Plan limitations not clearly communicated',
        recommended_response: 'That feature is available on our Pro plan. You can upgrade from Settings > Billing.',
        estimated_frequency: 'medium',
        day_likely_to_occur: 2
      }
    ],
    recommended_responses: [
      {
        ticket_type: "Can't log in after signup",
        response: "Please check your email for a confirmation link. If you don't see it, check your spam folder. I can also manually verify your account if needed.",
        tone: "calm, precise, non-defensive",
        avoid: "No promises about fixing the flow"
      },
      {
        ticket_type: "Empty dashboard confusion",
        response: "Welcome! To get started, click the 'New' button in the top right. Our quick start guide at [link] walks through the first steps.",
        tone: "helpful, guiding",
        avoid: "Don't blame the user for not finding it"
      },
      {
        ticket_type: "Feature locked complaint",
        response: "That feature is part of our Pro plan. You can see all plan features at [pricing page]. Happy to answer any questions about what's included.",
        tone: "transparent, not salesy",
        avoid: "Don't oversell or pressure"
      }
    ],
    kill_test_tickets: [
      {
        id: 'kill-001',
        title: "Can't log in after signup",
        description: 'Critical authentication flow issue',
        category: 'signup_access',
        severity: 'high',
        status: 'should_prevent',
        triggering_action: 'Signup flow',
        root_cause: 'Email confirmation UX',
        recommended_response: 'Check email for confirmation',
        estimated_frequency: 'high',
        day_likely_to_occur: 1
      },
      {
        id: 'kill-002',
        title: "Nothing happens when I click",
        description: 'Silent failures erode trust',
        category: 'feels_broken',
        severity: 'high',
        status: 'should_prevent',
        triggering_action: 'Any button click',
        root_cause: 'Missing feedback',
        recommended_response: 'Refresh and retry',
        estimated_frequency: 'high',
        day_likely_to_occur: 1
      }
    ],
    constraints_applied: [
      'No feature building',
      'No big-picture roadmap fixes',
      'No "educate the user" hand-waving',
      'Be brutally realistic'
    ]
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'should_prevent': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'must_accept': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-yellow-500" />
            Week-1 Support Ticket Simulation
          </h1>
          <p className="mt-2 text-gray-600">
            Predict and prepare for support tickets before they happen. 
            This simulation helps you identify issues users will face in their first 7 days.
          </p>
        </div>

        {!result ? (
          /* Configuration Form */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Context */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Context</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={productContext.product_name}
                      onChange={(e) => setProductContext(prev => ({ ...prev, product_name: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Kestrel AI Voice Agent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Description *
                    </label>
                    <textarea
                      value={productContext.product_description}
                      onChange={(e) => setProductContext(prev => ({ ...prev, product_description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe what your product does..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Users
                    </label>
                    <input
                      type="text"
                      value={productContext.target_users}
                      onChange={(e) => setProductContext(prev => ({ ...prev, target_users: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., HVAC business owners, small service companies"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Key Features
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a feature..."
                      />
                      <button
                        onClick={handleAddFeature}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productContext.key_features.map((feature, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                          {feature}
                          <button 
                            onClick={() => setProductContext(prev => ({
                              ...prev,
                              key_features: prev.key_features.filter((_, idx) => idx !== i)
                            }))}
                            className="hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Known Limitations
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={limitationInput}
                        onChange={(e) => setLimitationInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLimitation()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add a limitation..."
                      />
                      <button
                        onClick={handleAddLimitation}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productContext.known_limitations.map((limitation, i) => (
                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm flex items-center gap-1">
                          {limitation}
                          <button 
                            onClick={() => setProductContext(prev => ({
                              ...prev,
                              known_limitations: prev.known_limitations.filter((_, idx) => idx !== i)
                            }))}
                            className="hover:text-orange-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Onboarding Flow
                    </label>
                    <input
                      type="text"
                      value={productContext.onboarding_flow}
                      onChange={(e) => setProductContext(prev => ({ ...prev, onboarding_flow: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Email signup → Email verification → Dashboard"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pricing Tiers
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={pricingInput}
                        onChange={(e) => setPricingInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPricing()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Free, Pro ($49/mo), Enterprise"
                      />
                      <button
                        onClick={handleAddPricing}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productContext.pricing_tiers.map((tier, i) => (
                        <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-1">
                          {tier}
                          <button 
                            onClick={() => setProductContext(prev => ({
                              ...prev,
                              pricing_tiers: prev.pricing_tiers.filter((_, idx) => idx !== i)
                            }))}
                            className="hover:text-green-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Settings */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Simulation Depth
                    </label>
                    <div className="space-y-2">
                      {(['quick', 'standard', 'deep'] as const).map((depth) => (
                        <label key={depth} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="depth"
                            checked={simulationDepth === depth}
                            onChange={() => setSimulationDepth(depth)}
                            className="w-4 h-4 text-blue-500"
                          />
                          <span className="capitalize">{depth}</span>
                          <span className="text-xs text-gray-500">
                            ({depth === 'quick' ? '~2 tickets/category' : depth === 'standard' ? '~4 tickets/category' : '~6 tickets/category'})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Categories (optional)
                    </label>
                    <div className="space-y-2">
                      {Object.entries(AUTOCYCLE_PASSES).map(([key, pass]) => {
                        const Icon = pass.icon;
                        return (
                          <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(key)}
                              onChange={() => toggleCategory(key)}
                              className="w-4 h-4 text-blue-500 rounded"
                            />
                            <Icon className={`w-4 h-4 ${pass.color}`} />
                            <span className="text-sm">{pass.name}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Leave empty to run all categories
                    </p>
                  </div>
                </div>
              </div>

              {/* Run Button */}
              <button
                onClick={runSimulation}
                disabled={isRunning || !productContext.product_name}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Run Simulation
                  </>
                )}
              </button>

              {/* Constraints Info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <h3 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Simulation Constraints
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• No feature building suggestions</li>
                  <li>• No long-term roadmap fixes</li>
                  <li>• No "educate the user" hand-waving</li>
                  <li>• Brutally realistic predictions</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-3xl font-bold text-gray-900">{result.total_tickets_predicted}</div>
                <div className="text-sm text-gray-500">Total Tickets Predicted</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <div className="text-3xl font-bold text-red-600">{result.tickets_by_severity.high || 0}</div>
                <div className="text-sm text-gray-500">High Severity</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
                <div className="text-3xl font-bold text-blue-600">{result.tickets_to_prevent.length}</div>
                <div className="text-sm text-gray-500">Should Prevent</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                <div className="text-3xl font-bold text-green-600">{result.tickets_to_accept.length}</div>
                <div className="text-sm text-gray-500">Must Accept</div>
              </div>
            </div>

            {/* Kill Test Warning */}
            {result.kill_test_tickets.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Kill Test Tickets ({result.kill_test_tickets.length})
                </h3>
                <p className="text-sm text-red-700 mb-4">
                  These tickets would fail a "kill test" - they create trust risk and must be addressed before launch.
                </p>
                <div className="space-y-2">
                  {result.kill_test_tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white rounded-lg p-3 border border-red-200">
                      <div className="font-medium text-red-900">{ticket.title}</div>
                      <div className="text-sm text-red-700">{ticket.root_cause}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {[
                    { key: 'prevent', label: 'Should Prevent', count: result.tickets_to_prevent.length },
                    { key: 'accept', label: 'Must Accept', count: result.tickets_to_accept.length },
                    { key: 'responses', label: 'Recommended Responses', count: result.recommended_responses.length }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as typeof activeTab)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 ${
                        activeTab === tab.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'prevent' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      These tickets can be prevented with cheap fixes before launch.
                    </p>
                    {result.tickets_to_prevent.map((ticket) => (
                      <TicketCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        expanded={expandedTickets.has(ticket.id)}
                        onToggle={() => toggleTicketExpand(ticket.id)}
                        getSeverityColor={getSeverityColor}
                        getStatusIcon={getStatusIcon}
                      />
                    ))}
                  </div>
                )}

                {activeTab === 'accept' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      These tickets are not worth fixing pre-launch. Prepare canned responses instead.
                    </p>
                    {result.tickets_to_accept.map((ticket) => (
                      <TicketCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        expanded={expandedTickets.has(ticket.id)}
                        onToggle={() => toggleTicketExpand(ticket.id)}
                        getSeverityColor={getSeverityColor}
                        getStatusIcon={getStatusIcon}
                      />
                    ))}
                  </div>
                )}

                {activeTab === 'responses' && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Pre-written responses for tickets you must accept. Keep these ready.
                    </p>
                    {result.recommended_responses.map((response, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{response.ticket_type}</h4>
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-gray-700">{response.response}</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">
                            <strong>Tone:</strong> {response.tone}
                          </span>
                          <span className="text-red-600">
                            <strong>Avoid:</strong> {response.avoid}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Run Again Button */}
            <button
              onClick={() => setResult(null)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Run New Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TicketCard({ 
  ticket, 
  expanded, 
  onToggle,
  getSeverityColor,
  getStatusIcon
}: { 
  ticket: SimulatedTicket; 
  expanded: boolean;
  onToggle: () => void;
  getSeverityColor: (severity: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}) {
  const passInfo = AUTOCYCLE_PASSES[ticket.category as keyof typeof AUTOCYCLE_PASSES];
  const Icon = passInfo?.icon || AlertTriangle;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${passInfo?.color || 'text-gray-500'}`} />
          <span className="font-medium text-gray-900">{ticket.title}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs border ${getSeverityColor(ticket.severity)}`}>
            {ticket.severity}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            {getStatusIcon(ticket.status)}
            {ticket.status === 'should_prevent' ? 'Prevent' : 'Accept'}
          </span>
        </div>
        {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
      </button>
      
      {expanded && (
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Description</div>
            <p className="text-gray-700">{ticket.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase mb-1">Triggering Action</div>
              <p className="text-sm text-gray-700">{ticket.triggering_action}</p>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase mb-1">Root Cause</div>
              <p className="text-sm text-gray-700">{ticket.root_cause}</p>
            </div>
          </div>

          {ticket.user_expectation_gap && (
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase mb-1">Expectation Gap</div>
              <p className="text-sm text-gray-700">{ticket.user_expectation_gap}</p>
            </div>
          )}

          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">Recommended Response</div>
            <p className="text-gray-700">{ticket.recommended_response}</p>
          </div>

          {ticket.prevention_suggestion && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-xs font-medium text-blue-600 uppercase mb-1">Prevention Suggestion</div>
              <p className="text-blue-800">{ticket.prevention_suggestion}</p>
            </div>
          )}

          <div className="flex gap-4 text-sm text-gray-500">
            <span>Frequency: <strong>{ticket.estimated_frequency}</strong></span>
            <span>Likely Day: <strong>Day {ticket.day_likely_to_occur}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
