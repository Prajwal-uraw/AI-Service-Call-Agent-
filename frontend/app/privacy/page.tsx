export const metadata = {
  title: 'Privacy Policy | KestrelVoice',
  description: 'KestrelVoice privacy policy and data protection practices',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 max-w-4xl py-20">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-neutral-600 mb-8">
            Last updated: December 24, 2024
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Information We Collect</h2>
            <p className="text-neutral-700 mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Account information (name, email, phone number)</li>
              <li>Business information (company name, industry, size)</li>
              <li>Call recordings and transcripts</li>
              <li>Usage data and analytics</li>
              <li>Payment information (processed securely through Stripe)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-neutral-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns and optimize performance</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. Data Security</h2>
            <p className="text-neutral-700 mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>End-to-end encryption for call data</li>
              <li>SOC 2 Type II compliance</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication</li>
              <li>Secure data centers with 99.9% uptime</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Data Retention</h2>
            <p className="text-neutral-700">
              We retain your information for as long as your account is active or as needed to provide services. 
              Call recordings are retained for 90 days by default, with options for extended retention.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Your Rights</h2>
            <p className="text-neutral-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Compliance</h2>
            <p className="text-neutral-700">
              KestrelVoice complies with GDPR, CCPA, and other applicable data protection regulations. 
              We are committed to protecting your privacy and handling your data responsibly.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Contact Us</h2>
            <p className="text-neutral-700">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-neutral-700 mt-4">
              Email: privacy@kestrelvoice.com<br />
              Address: [Your Business Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
