'use client';

export default function IntegrationSection() {
  const integrations = [
    { name: 'ServiceTitan', category: 'CRM' },
    { name: 'Housecall Pro', category: 'CRM' },
    { name: 'Jobber', category: 'CRM' },
    { name: 'ServiceM8', category: 'CRM' },
    { name: 'Google Calendar', category: 'Scheduling' },
    { name: 'Calendly', category: 'Scheduling' },
    { name: 'Twilio', category: 'Phone' },
    { name: 'Zapier', category: 'Automation' },
    { name: 'Stripe', category: 'Payments' }
  ];

  return (
    <section className="py-24 bg-neutral-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-neutral-100 border border-neutral-200 rounded-full mb-4">
            <span className="text-sm font-medium text-neutral-700">Integrations</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Works with your existing tools
          </h2>
          <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
            Seamlessly connects with the CRM, scheduling, and payment tools you already use
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {integrations.map((integration, index) => (
              <div
                key={index}
                className="group bg-white border border-neutral-200 rounded-lg p-8 hover:border-neutral-300 hover:shadow-lg transition-all text-center"
              >
                <div className="w-16 h-16 bg-neutral-100 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                  <span className="text-2xl font-bold text-neutral-400 group-hover:text-neutral-600">
                    {integration.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1">{integration.name}</h3>
                <p className="text-xs text-neutral-500 uppercase tracking-wide">{integration.category}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-neutral-600 mb-4">Don't see your tool? We can build custom integrations.</p>
            <a 
              href="/calendar"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Request integration →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
