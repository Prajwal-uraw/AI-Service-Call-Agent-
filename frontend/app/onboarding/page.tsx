"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { parseError, logError } from "@/lib/errors";
import { 
  Building2, 
  User, 
  Phone, 
  CreditCard, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Check
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    company_name: "",
    industry: "hvac",
    website_url: "",
    
    // Step 2: Owner Details
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    
    // Step 3: Subdomain
    slug: "",
    subdomain: "",
    
    // Step 4: Plan Selection
    plan_tier: "professional",
    
    // Step 5: Phone Setup
    twilio_phone_number: "",
    forward_to_number: "",
    emergency_phone: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tenantCreated, setTenantCreated] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from company name
    if (field === "company_name") {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      setFormData(prev => ({ ...prev, slug, subdomain: slug }));
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      setError("");
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError("");
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.company_name) {
          setError("Company name is required");
          return false;
        }
        return true;
      case 2:
        if (!formData.owner_name || !formData.owner_email) {
          setError("Owner name and email are required");
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.owner_email)) {
          setError("Please enter a valid email");
          return false;
        }
        return true;
      case 3:
        if (!formData.slug) {
          setError("Subdomain is required");
          return false;
        }
        if (!/^[a-z0-9-]+$/.test(formData.slug)) {
          setError("Subdomain can only contain lowercase letters, numbers, and hyphens");
          return false;
        }
        return true;
      case 4:
        return true;
      case 5:
        if (!formData.forward_to_number) {
          setError("Forward to number is required");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${API_URL}/api/admin/tenants/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to create account");
      }
      
      const tenant = await response.json();
      setTenantCreated(true);
      setStep(6);
      
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, 'OnboardingPage.handleSubmit');
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => updateField("company_name", e.target.value)}
                placeholder="e.g., Acme HVAC Services"
                className="w-full border rounded-lg px-4 py-3 text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                aria-label="Select your industry"
                className="w-full border rounded-lg px-4 py-3 text-lg"
              >
                <option value="hvac">HVAC</option>
                <option value="plumbing">Plumbing</option>
                <option value="both">HVAC & Plumbing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Website (Optional)</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => updateField("website_url", e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full border rounded-lg px-4 py-3 text-lg"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name *</label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) => updateField("owner_name", e.target.value)}
                placeholder="John Smith"
                className="w-full border rounded-lg px-4 py-3 text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={formData.owner_email}
                onChange={(e) => updateField("owner_email", e.target.value)}
                placeholder="john@acmehvac.com"
                className="w-full border rounded-lg px-4 py-3 text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                value={formData.owner_phone}
                onChange={(e) => updateField("owner_phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full border rounded-lg px-4 py-3 text-lg"
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your Dashboard URL *</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="acme-hvac"
                  className="flex-1 border rounded-lg px-4 py-3 text-lg font-mono"
                />
                <span className="text-gray-500">.kestrel.ai</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                This will be your dashboard URL: <strong>{formData.slug || "your-company"}.kestrel.ai</strong>
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Choose something memorable and professional. You can't change this later.
              </p>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Professional Plan */}
              <div 
                onClick={() => updateField("plan_tier", "professional")}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  formData.plan_tier === "professional" 
                    ? "border-blue-600 bg-blue-50" 
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Professional</h3>
                    <p className="text-sm text-gray-600">For growing companies</p>
                  </div>
                  {formData.plan_tier === "professional" && (
                    <CheckCircle className="text-blue-600" size={24} />
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold">$1,497<span className="text-lg text-gray-600">/mo</span></div>
                  <div className="text-sm text-gray-600">+ $4,997 setup fee</div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span>Up to 1,500 calls/month</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span>48-hour deployment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
              
              {/* Premium Plan */}
              <div 
                onClick={() => updateField("plan_tier", "premium")}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                  formData.plan_tier === "premium" 
                    ? "border-gray-800 bg-gray-50" 
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Premium</h3>
                    <p className="text-sm text-gray-600">Multi-location & enterprise</p>
                  </div>
                  {formData.plan_tier === "premium" && (
                    <CheckCircle className="text-gray-800" size={24} />
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold">$2,497<span className="text-lg text-gray-600">/mo</span></div>
                  <div className="text-sm text-gray-600">+ $9,997 setup fee</div>
                </div>
                
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span><strong>Unlimited calls</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span>Multi-location support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                    <span>24/7 priority support</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>14-Day Free Trial</strong> - No credit card required to start
              </p>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> We'll set up your Twilio phone number during onboarding. 
                For now, just tell us where to forward calls.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Forward Calls To *</label>
              <input
                type="tel"
                value={formData.forward_to_number}
                onChange={(e) => updateField("forward_to_number", e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full border rounded-lg px-4 py-3 text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">
                When AI can't handle a call, we'll transfer to this number
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Emergency Phone (Optional)</label>
              <input
                type="tel"
                value={formData.emergency_phone}
                onChange={(e) => updateField("emergency_phone", e.target.value)}
                placeholder="+1 (555) 999-9999"
                className="w-full border rounded-lg px-4 py-3 text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">
                For urgent situations (gas leaks, no heat, etc.)
              </p>
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Kestrel!</h2>
              <p className="text-xl text-gray-600">Your account has been created successfully</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
              <h3 className="font-semibold mb-4">What happens next:</h3>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                  <span>Our team will contact you within 24 hours to schedule your deployment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  <span>We'll set up your Twilio phone number and configure your AI agent</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                  <span>Your voice agent will be live in 48 hours</span>
                </li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = `https://${formData.subdomain}.kestrel.ai/dashboard`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              >
                Go to Dashboard
              </Button>
              
              <p className="text-sm text-gray-500">
                Dashboard URL: <strong>{formData.subdomain}.kestrel.ai</strong>
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const stepIcons = [
    { icon: Building2, label: "Company" },
    { icon: User, label: "Owner" },
    { icon: Phone, label: "Subdomain" },
    { icon: CreditCard, label: "Plan" },
    { icon: Phone, label: "Phone Setup" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Get Started with Kestrel</h1>
          <p className="text-gray-600">Set up your AI voice agent in 5 minutes</p>
        </div>
        
        {/* Progress Steps */}
        {step < 6 && (
          <div className="flex justify-between mb-8">
            {stepIcons.map((item, index) => {
              const stepNum = index + 1;
              const Icon = item.icon;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              
              return (
                <div key={stepNum} className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? "bg-green-500 text-white" :
                    isActive ? "bg-blue-600 text-white" :
                    "bg-gray-200 text-gray-400"
                  }`}>
                    {isCompleted ? <Check size={24} /> : <Icon size={24} />}
                  </div>
                  <span className={`text-xs ${isActive ? "font-semibold" : ""}`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Company Information"}
              {step === 2 && "Owner Details"}
              {step === 3 && "Choose Your Subdomain"}
              {step === 4 && "Select Your Plan"}
              {step === 5 && "Phone Configuration"}
              {step === 6 && "Setup Complete!"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <ErrorMessage 
                message={error} 
                type="error"
                dismissible
                onDismiss={() => setError("")}
              />
            )}
            
            {renderStep()}
            
            {/* Navigation Buttons */}
            {step < 6 && (
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2" size={20} />
                    Back
                  </Button>
                )}
                
                {step < 5 ? (
                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continue
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Creating Account...</span>
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <CheckCircle className="ml-2" size={20} />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Trust Badges */}
        {step < 6 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <div className="flex justify-center items-center gap-6">
              <div className="flex items-center gap-2">
                <Check className="text-green-500" size={16} />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-500" size={16} />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="text-green-500" size={16} />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
