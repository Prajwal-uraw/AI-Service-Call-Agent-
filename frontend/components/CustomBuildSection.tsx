export default function CustomBuildSection() {
  const features = [
    {
      emoji: "🎯",
      title: "Your Pricing & Services",
      description: "We configure your exact pricing for repairs, installations, maintenance—everything customers ask about."
    },
    {
      emoji: "🚨",
      title: "Emergency Protocols",
      description: "Gas leaks, CO alarms, no heat in winter—we program your specific emergency routing and escalation procedures."
    },
    {
      emoji: "📅",
      title: "Scheduling Rules",
      description: "Your availability, service areas, drive times, tech schedules—integrated with ServiceTitan or Housecall Pro."
    },
    {
      emoji: "🗣️",
      title: "Voice & Personality",
      description: "Sounds like YOUR company—friendly, professional, matches your brand. Not robotic like DIY tools."
    },
    {
      emoji: "🌡️",
      title: "Seasonal Adaptation",
      description: "Automatically adjusts messaging for winter heating emergencies vs. summer AC failures."
    },
    {
      emoji: "🔧",
      title: "HVAC Knowledge Base",
      description: "Pre-loaded with equipment types, brands, common issues—speaks fluent HVAC, not generic customer service."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-blue-700 text-white">
      <div className="container mx-auto px-6">
        
        <h2 className="text-4xl font-bold text-center mb-12">
          What Kestrel Custom-Builds For Your Business
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur p-6 rounded-lg">
              <div className="text-3xl mb-4">{feature.emoji}</div>
              <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text-blue-100">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a 
            href="tel:+15551234567"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Schedule Your Custom Build Consultation
          </a>
        </div>
        
      </div>
    </section>
  );
}
