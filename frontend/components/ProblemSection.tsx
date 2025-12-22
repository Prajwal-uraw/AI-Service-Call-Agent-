export default function ProblemSection() {
  const problems = [
    {
      emoji: "😤",
      title: "Takes Forever To Configure",
      description: "Spent 20+ hours on Vapi trying to write prompts that don't sound robotic. Still sounds like garbage and customers hang up."
    },
    {
      emoji: "🤯",
      title: "Too Technical For Me",
      description: "I'm an HVAC guy, not a programmer. Don't have time to learn APIs, webhooks, and whatever else these platforms require."
    },
    {
      emoji: "😱",
      title: "Can't Handle Emergencies",
      description: "Generic AI doesn't understand gas leaks vs. AC not cooling. One mistake and I'm liable. Too risky."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        
        <h2 className="text-3xl font-bold text-center mb-12">
          You've Tried The DIY Tools. We Know How That Went.
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="text-4xl mb-4">{problem.emoji}</div>
              <h3 className="font-bold text-xl mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-600">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
