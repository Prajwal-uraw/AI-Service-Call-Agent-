'use client';

import { useState } from 'react';
import { ArrowRight, Download, CheckCircle, AlertCircle } from 'lucide-react';

interface ReportLeadFormProps {
  onSuccess?: (data: LeadFormData) => void;
  reportTitle?: string;
}

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  numberOfTechnicians: string;
  currentCallVolume: string;
  primaryChallenge: string;
  source: string;
}

export default function ReportLeadForm({ onSuccess, reportTitle = "Sample Pilot Report" }: ReportLeadFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    jobTitle: '',
    numberOfTechnicians: '',
    currentCallVolume: '',
    primaryChallenge: '',
    source: 'sample_report_download'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone: string) => {
    const re = /^[\d\s\-\+\(\)]+$/;
    return phone.length >= 10 && re.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          leadType: 'sample_report',
          reportTitle,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      setSubmitStatus('success');
      
      if (onSuccess) {
        onSuccess(formData);
      }

      // Trigger download after successful submission
      setTimeout(() => {
        window.open('/sample-pilot-report.pdf', '_blank');
      }, 1000);

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage('Unable to submit form. Please try again or contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof LeadFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">
          Download Starting...
        </h3>
        <p className="text-neutral-700 mb-4">
          Your sample pilot report is downloading. Check your downloads folder.
        </p>
        <p className="text-sm text-neutral-600">
          We'll be in touch soon to discuss how KestrelVoice can help your business.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitStatus === 'error' && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Submission Failed</p>
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Name Fields */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-semibold text-neutral-900 mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.firstName ? 'border-red-500' : 'border-neutral-300'
            }`}
            placeholder="John"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-semibold text-neutral-900 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              errors.lastName ? 'border-red-500' : 'border-neutral-300'
            }`}
            placeholder="Smith"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-neutral-900 mb-2">
          Business Email *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.email ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="john@comfortprohvac.com"
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-neutral-900 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.phone ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="(555) 123-4567"
        />
        {errors.phone && (
          <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Company */}
      <div>
        <label htmlFor="company" className="block text-sm font-semibold text-neutral-900 mb-2">
          Company Name *
        </label>
        <input
          type="text"
          id="company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.company ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="Comfort Pro HVAC"
        />
        {errors.company && (
          <p className="text-sm text-red-600 mt-1">{errors.company}</p>
        )}
      </div>

      {/* Job Title */}
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-semibold text-neutral-900 mb-2">
          Job Title *
        </label>
        <input
          type="text"
          id="jobTitle"
          name="jobTitle"
          value={formData.jobTitle}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            errors.jobTitle ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="Owner, Operations Manager, etc."
        />
        {errors.jobTitle && (
          <p className="text-sm text-red-600 mt-1">{errors.jobTitle}</p>
        )}
      </div>

      {/* Business Details */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="numberOfTechnicians" className="block text-sm font-semibold text-neutral-900 mb-2">
            Number of Technicians
          </label>
          <select
            id="numberOfTechnicians"
            name="numberOfTechnicians"
            value={formData.numberOfTechnicians}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Select...</option>
            <option value="1-5">1-5 technicians</option>
            <option value="6-10">6-10 technicians</option>
            <option value="11-20">11-20 technicians</option>
            <option value="21-50">21-50 technicians</option>
            <option value="50+">50+ technicians</option>
          </select>
        </div>

        <div>
          <label htmlFor="currentCallVolume" className="block text-sm font-semibold text-neutral-900 mb-2">
            Weekly Call Volume
          </label>
          <select
            id="currentCallVolume"
            name="currentCallVolume"
            value={formData.currentCallVolume}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Select...</option>
            <option value="0-50">0-50 calls/week</option>
            <option value="51-100">51-100 calls/week</option>
            <option value="101-200">101-200 calls/week</option>
            <option value="201-500">201-500 calls/week</option>
            <option value="500+">500+ calls/week</option>
          </select>
        </div>
      </div>

      {/* Primary Challenge */}
      <div>
        <label htmlFor="primaryChallenge" className="block text-sm font-semibold text-neutral-900 mb-2">
          Primary Call Handling Challenge
        </label>
        <select
          id="primaryChallenge"
          name="primaryChallenge"
          value={formData.primaryChallenge}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Select...</option>
          <option value="missed-calls">Missed calls during peak hours</option>
          <option value="after-hours">After-hours call handling</option>
          <option value="booking-speed">Slow booking process</option>
          <option value="staff-capacity">Staff capacity limitations</option>
          <option value="call-quality">Inconsistent call quality</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-neutral-700">
          By downloading this report, you agree to receive communications from KestrelVoice about our voice operations platform. 
          We respect your privacy and will never share your information with third parties.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Download Sample Report
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-xs text-center text-neutral-500">
        * Required fields
      </p>
    </form>
  );
}
