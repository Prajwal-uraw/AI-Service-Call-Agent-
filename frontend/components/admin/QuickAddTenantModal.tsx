"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { parseError, logError } from "@/lib/errors";
import { Plus, CheckCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface QuickAddTenantModalProps {
  onSuccess?: () => void;
}

export default function QuickAddTenantModal({ onSuccess }: QuickAddTenantModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: "",
    slug: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    industry: "hvac",
    plan_tier: "professional",
    twilio_phone_number: "",
    forward_to_number: "",
    emergency_phone: "",
    skip_trial: false
  });

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "company_name" && typeof value === "string") {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    try {
      if (!formData.company_name || !formData.slug || !formData.owner_email) {
        throw new Error("Company name, slug, and owner email are required");
      }

      const payload = {
        company_name: formData.company_name,
        slug: formData.slug,
        owner_name: formData.owner_name || formData.company_name,
        owner_email: formData.owner_email,
        owner_phone: formData.owner_phone || undefined,
        industry: formData.industry,
        plan_tier: formData.plan_tier,
        twilio_phone_number: formData.twilio_phone_number || undefined,
        forward_to_number: formData.forward_to_number || undefined
      };

      const response = await fetch(`${API_URL}/api/admin/tenants/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to create tenant");
      }
      
      const tenant = await response.json();
      setSuccess(true);
      
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setFormData({
          company_name: "",
          slug: "",
          owner_name: "",
          owner_email: "",
          owner_phone: "",
          industry: "hvac",
          plan_tier: "professional",
          twilio_phone_number: "",
          forward_to_number: "",
          emergency_phone: "",
          skip_trial: false
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
      
    } catch (err: any) {
      const appError = parseError(err);
      logError(appError, 'QuickAddTenantModal.handleSubmit');
      setError(appError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="mr-2" size={20} />
          Add New Tenant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Add Tenant</DialogTitle>
        </DialogHeader>
        
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Tenant Created Successfully!</h3>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <ErrorMessage 
                message={error} 
                type="error"
                dismissible
                onDismiss={() => setError("")}
              />
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => updateField("company_name", e.target.value)}
                  placeholder="e.g., HAIEC"
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="slug">Slug (URL identifier) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="haiec"
                  pattern="^[a-z0-9-]+$"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dashboard URL: {formData.slug || "slug"}.kestrel.ai
                </p>
              </div>
              
              <div>
                <Label htmlFor="owner_name">Owner Name</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => updateField("owner_name", e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              
              <div>
                <Label htmlFor="owner_email">Owner Email *</Label>
                <Input
                  id="owner_email"
                  type="email"
                  value={formData.owner_email}
                  onChange={(e) => updateField("owner_email", e.target.value)}
                  placeholder="admin@haiec.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="owner_phone">Owner Phone</Label>
                <Input
                  id="owner_phone"
                  type="tel"
                  value={formData.owner_phone}
                  onChange={(e) => updateField("owner_phone", e.target.value)}
                  placeholder="+18573825169"
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry} onValueChange={(value) => updateField("industry", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="both">HVAC & Plumbing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="plan_tier">Plan Tier</Label>
                <Select value={formData.plan_tier} onValueChange={(value) => updateField("plan_tier", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="twilio_phone_number">Twilio Phone Number</Label>
                <Input
                  id="twilio_phone_number"
                  type="tel"
                  value={formData.twilio_phone_number}
                  onChange={(e) => updateField("twilio_phone_number", e.target.value)}
                  placeholder="+18573825169"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to provision later</p>
              </div>
              
              <div>
                <Label htmlFor="forward_to_number">Forward To Number</Label>
                <Input
                  id="forward_to_number"
                  type="tel"
                  value={formData.forward_to_number}
                  onChange={(e) => updateField("forward_to_number", e.target.value)}
                  placeholder="+18573825169"
                />
              </div>
              
              <div>
                <Label htmlFor="emergency_phone">Emergency Phone</Label>
                <Input
                  id="emergency_phone"
                  type="tel"
                  value={formData.emergency_phone}
                  onChange={(e) => updateField("emergency_phone", e.target.value)}
                  placeholder="+18573825169"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="skip_trial"
                checked={formData.skip_trial}
                onChange={(e) => updateField("skip_trial", e.target.checked)}
                className="rounded"
                aria-label="Skip trial and activate immediately"
              />
              <Label htmlFor="skip_trial" className="cursor-pointer">
                Skip trial (activate immediately)
              </Label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating...</span>
                  </>
                ) : (
                  "Create Tenant"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
