export const metadata = {
  title: 'Terms of Service | KestrelVoice',
  description: 'KestrelVoice terms of service and usage agreement',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 max-w-4xl py-20">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-neutral-600 mb-8">
            Last updated: December 24, 2024
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-700">
              By accessing and using KestrelVoice services, you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Service Description</h2>
            <p className="text-neutral-700 mb-4">
              KestrelVoice provides AI-powered voice operations platform for service businesses, including:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Automated call answering and routing</li>
              <li>Appointment booking and scheduling</li>
              <li>CRM integration and data synchronization</li>
              <li>Call analytics and reporting</li>
              <li>Customer follow-up automation</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. User Responsibilities</h2>
            <p className="text-neutral-700 mb-4">
              You agree to:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Provide accurate account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not misuse or abuse the service</li>
              <li>Notify us of any unauthorized access</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Payment Terms</h2>
            <p className="text-neutral-700">
              Subscription fees are billed monthly or annually in advance. All fees are non-refundable except as required by law. 
              We reserve the right to change pricing with 30 days notice.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Service Level Agreement</h2>
            <p className="text-neutral-700">
              We strive to maintain 99.9% uptime for our services. In the event of extended downtime, 
              you may be eligible for service credits as outlined in our SLA.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Intellectual Property</h2>
            <p className="text-neutral-700">
              All content, features, and functionality of KestrelVoice are owned by us and protected by copyright, 
              trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-neutral-700">
              KestrelVoice shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use or inability to use the service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Termination</h2>
            <p className="text-neutral-700">
              Either party may terminate this agreement at any time. Upon termination, your access to the service will cease, 
              and you will be responsible for any outstanding fees.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Contact Information</h2>
            <p className="text-neutral-700">
              For questions about these Terms of Service, contact us at:
            </p>
            <p className="text-neutral-700 mt-4">
              Email: legal@kestrelvoice.com<br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
