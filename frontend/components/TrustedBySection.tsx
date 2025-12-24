"use client";

export default function TrustedBySection() {
  const companies = [
    { name: "ServiceTitan", width: "w-32" },
    { name: "Housecall Pro", width: "w-36" },
    { name: "Jobber", width: "w-28" },
    { name: "FieldEdge", width: "w-32" },
    { name: "ServiceM8", width: "w-32" },
    { name: "Workiz", width: "w-28" }
  ];

  return (
    <section className="py-16 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Trusted by Leading Service Businesses
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Integrates with Your Existing Tools
          </h2>
        </div>
        
        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center max-w-6xl mx-auto">
          {companies.map((company, index) => (
            <div 
              key={index}
              className="flex items-center justify-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 w-full h-24"
            >
              <div className={`${company.width} h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center`}>
                <span className="text-xs font-semibold text-gray-600 text-center px-2">
                  {company.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-sm text-gray-600">Active Businesses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">1M+</div>
            <div className="text-sm text-gray-600">Calls Handled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">4.9/5</div>
            <div className="text-sm text-gray-600">Customer Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
