export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Discovery Call (30 min)",
      description: "We learn about your business: services, pricing, territory, emergency procedures, scheduling preferences.",
      time: "Day 1 - 30 minutes of your time",
      color: "bg-blue-500"
    },
    {
      number: "2",
      title: "We Build Your AI (Behind The Scenes)",
      description: "Our team custom-configures: scripts, emergency protocols, CRM integration, voice personality, scheduling logic. You do nothing.",
      time: "Day 1-2 - Zero work from you",
      color: "bg-blue-500"
    },
    {
      number: "3",
      title: "Test & Refine (With You)",
      description: "We run test scenarios: emergency calls, booking requests, pricing questions. You approve. We adjust until perfect.",
      time: "Day 2 - 1 hour of testing together",
      color: "bg-blue-500"
    },
    {
      number: "✓",
      title: "Go Live & We Monitor",
      description: "Forward your calls. Start capturing revenue. We monitor every call, optimize performance, and fix issues before you notice them.",
      time: "Day 2 onwards - Fully managed, forever",
      color: "bg-green-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        
        <h2 className="text-4xl font-bold text-center mb-4">
          From Call To Live In 48 Hours
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          We handle everything. You focus on running your HVAC business.
        </p>
        
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className={`flex gap-6 ${index < steps.length - 1 ? 'mb-12' : ''}`}>
              <div className="flex-shrink-0">
                <div className={`w-16 h-16 rounded-full ${step.color} text-white flex items-center justify-center text-2xl font-bold`}>
                  {step.number}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-3">
                  {step.description}
                </p>
                <div className={`text-sm font-medium ${step.color === 'bg-green-500' ? 'text-green-600' : 'text-blue-600'}`}>
                  ⏱️ {step.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
