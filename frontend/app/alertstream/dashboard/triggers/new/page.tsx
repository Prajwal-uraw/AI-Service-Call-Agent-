'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, TestTube } from 'lucide-react';
import type { TriggerCondition } from '@/lib/alertstream/types';

export default function NewTriggerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website_id: '',
    event_type: '',
    phone_number: '',
    sms_template: '',
  });
  const [conditions, setConditions] = useState<TriggerCondition[]>([]);

  // Mock websites
  const websites = [
    { id: '1', name: 'Main Website', domain: 'example.com' },
    { id: '2', name: 'E-commerce Store', domain: 'shop.example.com' },
    { id: '3', name: 'Blog', domain: 'blog.example.com' },
  ];

  const eventTypes = [
    { value: 'form_submit', label: 'Form Submission' },
    { value: 'order_created', label: 'New Order' },
    { value: 'user_signup', label: 'User Signup' },
    { value: 'comment_posted', label: 'Comment Posted' },
    { value: 'custom', label: 'Custom Event' },
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'exists', label: 'Exists' },
  ];

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof TriggerCondition, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const handleTest = () => {
    alert('Test SMS will be sent to ' + formData.phone_number);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push('/alertstream/dashboard/triggers');
    }, 1000);
  };

  const availableVariables = [
    '{{name}}', '{{email}}', '{{phone}}', '{{message}}',
    '{{order_id}}', '{{amount}}', '{{customer_name}}',
    '{{post_title}}', '{{author_name}}', '{{budget}}'
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/alertstream/dashboard/triggers"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Triggers</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Trigger</h1>
        <p className="text-gray-600">Set up automated SMS alerts for website events</p>
      </div>

      {/* Form */}
      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Trigger Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="New Form Submission"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website *
                </label>
                <select
                  id="website"
                  required
                  value={formData.website_id}
                  onChange={(e) => setFormData({ ...formData, website_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Select a website</option>
                  {websites.map(website => (
                    <option key={website.id} value={website.id}>
                      {website.name} ({website.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type *
                </label>
                <select
                  id="event_type"
                  required
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Select event type</option>
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Conditions</h2>
                <p className="text-sm text-gray-600">Optional: Add conditions to filter events</p>
              </div>
              <button
                type="button"
                onClick={addCondition}
                className="flex items-center space-x-2 text-sky-500 hover:text-sky-600"
              >
                <Plus className="h-5 w-5" />
                <span>Add Condition</span>
              </button>
            </div>

            {conditions.length === 0 ? (
              <p className="text-gray-500 text-sm">No conditions added. This trigger will fire for all events of the selected type.</p>
            ) : (
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={condition.field}
                      onChange={(e) => updateCondition(index, 'field', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(index, 'operator', e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    >
                      {operators.map(op => (
                        <option key={op.value} value={op.value}>{op.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Value"
                      value={condition.value}
                      onChange={(e) => updateCondition(index, 'value', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeCondition(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SMS Message */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">SMS Message</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Send to Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-2">
                  Message Template *
                </label>
                <textarea
                  id="template"
                  required
                  value={formData.sms_template}
                  onChange={(e) => setFormData({ ...formData, sms_template: e.target.value })}
                  placeholder="New form submission from {{name}}! Email: {{email}}"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Use variables like {'{{'} name {'}'} to insert dynamic data
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {availableVariables.map(variable => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => setFormData({ 
                        ...formData, 
                        sms_template: formData.sms_template + ' ' + variable 
                      })}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Trigger'}
            </button>
            <button
              type="button"
              onClick={handleTest}
              disabled={!formData.phone_number || !formData.sms_template}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TestTube className="h-5 w-5" />
              <span>Test</span>
            </button>
            <Link
              href="/alertstream/dashboard/triggers"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
