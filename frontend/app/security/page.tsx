"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Shield, Lock, Server, Eye, FileCheck, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function SecurityPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-24 mt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-blue-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-blue-300" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Enterprise-Grade Security & Compliance
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                Your data security and customer privacy are our top priorities. 
                Built with enterprise standards from day one.
              </p>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                  <div className="text-3xl font-bold text-blue-600">SOC 2</div>
                </div>
                <div className="text-sm text-gray-600">Type II Certified</div>
              </div>
              <div className="text-center">
                <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                  <div className="text-3xl font-bold text-green-600">HIPAA</div>
                </div>
                <div className="text-sm text-gray-600">Compliant</div>
              </div>
              <div className="text-center">
                <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                  <div className="text-3xl font-bold text-purple-600">GDPR</div>
                </div>
                <div className="text-sm text-gray-600">Compliant</div>
              </div>
              <div className="text-center">
                <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                  <div className="text-3xl font-bold text-orange-600">99.9%</div>
                </div>
                <div className="text-sm text-gray-600">Uptime SLA</div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center">Security Infrastructure</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                    <Lock className="h-7 w-7 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">End-to-End Encryption</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    All voice data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. 
                    Your customer conversations are protected with military-grade security.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">TLS 1.3 for all data in transit</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">AES-256 encryption at rest</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Encrypted database backups</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                    <Server className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Infrastructure Security</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Hosted on enterprise-grade cloud infrastructure with multiple layers of security, 
                    redundancy, and disaster recovery protocols.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Multi-region redundancy</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Automated backups every 6 hours</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">DDoS protection and WAF</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                    <Eye className="h-7 w-7 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Access Controls</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Granular access controls and authentication mechanisms ensure only authorized 
                    personnel can access sensitive data.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Multi-factor authentication (MFA)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Role-based access control (RBAC)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Audit logs for all access</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                  <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                    <FileCheck className="h-7 w-7 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Compliance & Auditing</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Regular security audits and compliance certifications ensure we meet the highest 
                    industry standards for data protection.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Annual penetration testing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Quarterly security audits</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">Continuous vulnerability scanning</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Privacy */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center">Data Privacy & Ownership</h2>
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Your Data is Your Data</h3>
                      <p className="text-gray-600 leading-relaxed">
                        You retain full ownership of all customer data, call recordings, and transcripts. 
                        We never use your data to train models or share it with third parties.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Data Retention Control</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Configure custom data retention policies. Export or delete your data at any time. 
                        When you leave, your data is permanently deleted within 30 days.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">GDPR & CCPA Compliant</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Full compliance with global privacy regulations. Built-in tools for data subject 
                        requests, consent management, and right-to-be-forgotten.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-orange-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Transparent Processing</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Clear documentation of how we process data, where it's stored, and who has access. 
                        No hidden data usage or surprise terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Uptime & Reliability */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center">Uptime & Reliability</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl border border-blue-200">
                  <div className="text-5xl font-bold text-blue-600 mb-2">99.9%</div>
                  <div className="text-lg font-semibold mb-4">Uptime SLA</div>
                  <p className="text-gray-700 text-sm">
                    Guaranteed uptime with financial credits if we fall short. Your business can't afford downtime.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl border border-green-200">
                  <div className="text-5xl font-bold text-green-600 mb-2">&lt;100ms</div>
                  <div className="text-lg font-semibold mb-4">Response Time</div>
                  <p className="text-gray-700 text-sm">
                    Lightning-fast AI responses ensure natural conversations without awkward pauses.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl border border-purple-200">
                  <div className="text-5xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-lg font-semibold mb-4">Monitoring</div>
                  <p className="text-gray-700 text-sm">
                    Round-the-clock system monitoring with automated alerts and instant incident response.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Incident Response */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold mb-12 text-center">Incident Response</h2>
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg">
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  In the unlikely event of a security incident, our dedicated response team follows 
                  a proven protocol to contain, investigate, and resolve issues quickly.
                </p>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="font-semibold mb-2">Detection</div>
                    <div className="text-sm text-gray-600">Automated monitoring alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="font-semibold mb-2">Response</div>
                    <div className="text-sm text-gray-600">&lt;15 min acknowledgment</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="font-semibold mb-2">Containment</div>
                    <div className="text-sm text-gray-600">Immediate isolation</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="font-semibold mb-2">Resolution</div>
                    <div className="text-sm text-gray-600">Full transparency</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Contact */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-12 text-white text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Questions About Security?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Our security team is here to answer any questions and provide detailed documentation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:security@kestrelvoice.com"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Contact Security Team
                </a>
                <a
                  href="/contact"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Request Security Docs
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
