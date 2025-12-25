export const metadata = {
  title: 'Compliance | KestrelVoice',
  description: 'KestrelVoice compliance certifications and security standards',
};

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 max-w-4xl py-20">
        <h1 className="text-4xl font-bold text-neutral-900 mb-8">Compliance & Certifications</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-neutral-600 mb-8">
            KestrelVoice maintains the highest standards of security and compliance to protect your data.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">SOC 2 Type II Certified</h2>
            <p className="text-neutral-700 mb-4">
              We are SOC 2 Type II certified, demonstrating our commitment to:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Security - Protection against unauthorized access</li>
              <li>Availability - System uptime and reliability</li>
              <li>Processing Integrity - Accurate and timely processing</li>
              <li>Confidentiality - Protection of sensitive information</li>
              <li>Privacy - Proper collection and use of personal data</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">GDPR Compliance</h2>
            <p className="text-neutral-700">
              We comply with the General Data Protection Regulation (GDPR) for all European customers, 
              ensuring proper data handling, consent management, and user rights protection.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">CCPA Compliance</h2>
            <p className="text-neutral-700">
              We comply with the California Consumer Privacy Act (CCPA), providing California residents 
              with enhanced privacy rights and data transparency.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">HIPAA Ready</h2>
            <p className="text-neutral-700">
              For healthcare-related service businesses, we offer HIPAA-compliant configurations 
              with Business Associate Agreements (BAA) available upon request.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Data Encryption</h2>
            <p className="text-neutral-700 mb-4">
              All data is encrypted both in transit and at rest:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>TLS 1.3 for data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>End-to-end encryption for call recordings</li>
              <li>Secure key management with AWS KMS</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Infrastructure Security</h2>
            <p className="text-neutral-700 mb-4">
              Our infrastructure is built on enterprise-grade cloud providers:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>AWS for compute and storage</li>
              <li>Multi-region redundancy</li>
              <li>Automated backups and disaster recovery</li>
              <li>DDoS protection and WAF</li>
              <li>24/7 security monitoring</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Regular Audits</h2>
            <p className="text-neutral-700">
              We conduct regular security audits and penetration testing to identify and address 
              potential vulnerabilities. Our security team continuously monitors for threats and 
              implements industry best practices.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Request Compliance Documentation</h2>
            <p className="text-neutral-700">
              For detailed compliance documentation, security questionnaires, or to discuss 
              enterprise security requirements, contact our security team:
            </p>
            <p className="text-neutral-700 mt-4">
              Email: security@kestrelvoice.com<br />
              Security Portal: <a href="/security" className="text-blue-600 hover:underline">kestrelvoice.com/security</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
