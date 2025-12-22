import { Clock, Code, AlertTriangle } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: Clock,
      color: "text-red-500",
      bgColor: "bg-red-50",
      title: "30% of Calls Go Unanswered",
      description: "Average service business misses 3 out of 10 calls during peak hours. Each missed call is $500-2000 in lost revenue."
    },
    {
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      title: "48-Hour Follow-Up Delay",
      description: "By the time you follow up, customers have already called your competitor. Speed wins in service industries."
    },
    {
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      title: "No After-Hours Coverage",
      description: "Emergency calls at 2 AM go to voicemail. Customers need help now, not tomorrow morning."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        
        <h2 className="text-3xl font-bold text-center mb-12">
          You've Tried The DIY Tools. We Know How That Went.
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-red-500">
                <div className={`w-14 h-14 ${problem.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-7 h-7 ${problem.color}`} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-900">
                  {problem.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
