'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare, Calendar } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    employees: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        employees: "",
        message: ""
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-neutral-900 text-white py-24 mt-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                Let's Talk
              </h1>
              <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                Ready to transform your service operations? Schedule a demo or reach out to our team.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Phone</h3>
                <a href="tel:+18885551234" className="text-blue-600 hover:text-blue-700">
                  (888) 555-1234
                </a>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:hello@kestrelvoice.com" className="text-blue-600 hover:text-blue-700">
                  hello@kestrelvoice.com
                </a>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Location</h3>
                <p className="text-gray-600 text-sm">San Francisco, CA</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Hours</h3>
                <p className="text-gray-600 text-sm">24/7 Support</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-24 bg-neutral-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
              <div className="grid md:grid-cols-2 gap-12">
                {/* Left Column - Info */}
                <div>
                  <h2 className="text-3xl font-bold mb-2 text-neutral-900">Send us a message</h2>
                  <p className="text-neutral-600 mb-8">We'll get back to you within 24 hours</p>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Fill out the form and our team will reach out within 2 hours during business hours. 
                    We'll discuss your specific needs and show you how Kestrel can help.
                  </p>
                  {/* Contact Info */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-orange-600" />
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Free Consultation</h3>
                        <p className="text-gray-600 text-sm">
                          30-minute call to understand your business and demonstrate our platform
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Custom Demo</h3>
                        <p className="text-gray-600 text-sm">
                          See how Kestrel works with your specific workflows and systems
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-neutral-200">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <MapPin className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">Email</p>
                        <p className="text-neutral-600">hello@kestrel.ai</p>
                        We'll calculate your potential revenue impact and cost savings
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Thank You!</h3>
                      <p className="text-gray-600">
                        We've received your message and will get back to you within 2 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="John Smith"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="john@company.com"
                        />
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-2">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          required
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Acme HVAC Services"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div>
                        <label htmlFor="employees" className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Employees
                        </label>
                        <select
                          id="employees"
                          name="employees"
                          value={formData.employees}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select range</option>
                          <option value="1-5">1-5 employees</option>
                          <option value="6-10">6-10 employees</option>
                          <option value="11-25">11-25 employees</option>
                          <option value="26-50">26-50 employees</option>
                          <option value="51+">51+ employees</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                          Tell us about your needs
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          placeholder="What challenges are you looking to solve?"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-neutral-900 text-white py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>

                      <p className="text-xs text-gray-500 text-center">
                        By submitting this form, you agree to our privacy policy and terms of service.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">How quickly can you deploy?</h3>
                  <p className="text-gray-600">
                    We deploy custom AI voice agents in 48 hours. After our initial consultation, 
                    we build your agent, integrate with your systems, and have you live within 2 business days.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">Do you require long-term contracts?</h3>
                  <p className="text-gray-600">
                    No. We offer month-to-month service with no long-term commitments. We're confident 
                    in our value and believe you should stay because it works, not because you're locked in.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">What integrations do you support?</h3>
                  <p className="text-gray-600">
                    We integrate with ServiceTitan, Housecall Pro, Jobber, and most major CRM/FSM platforms. 
                    We can also build custom integrations for your specific tools.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">What's your pricing?</h3>
                  <p className="text-gray-600">
                    Professional tier starts at $1,497/month with a one-time $4,997 custom build fee. 
                    This includes up to 1,500 calls/month, full integration, and ongoing optimization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
