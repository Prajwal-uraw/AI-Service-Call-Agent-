export default function TestimonialsSection() {
  const testimonials = [
    {
      rating: 5,
      text: "Tried Vapi for 2 months. Wasted so much time configuring it. Switched to HVAC AI Agent and they had us live in 2 days. Game changer.",
      name: "Mike Rodriguez",
      company: "Rodriguez HVAC, Phoenix"
    },
    {
      rating: 5,
      text: "Recovered $87K in after-hours calls in first 90 days. The emergency routing actually works—had a gas leak call at 2am, routed perfectly.",
      name: "Jennifer Walsh",
      company: "Climate Control Experts, Dallas"
    },
    {
      rating: 5,
      text: "I'm not technical at all. They did everything. Now I never miss a call and customers think it's my actual receptionist.",
      name: "Tom Chen",
      company: "Chen Heating & Air, Seattle"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        
        <h2 className="text-4xl font-bold text-center mb-16">
          HVAC Companies Trust Us With Their Calls
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-900 font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
