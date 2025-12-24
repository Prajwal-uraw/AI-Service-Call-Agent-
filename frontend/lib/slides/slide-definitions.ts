/**
 * Slide Definitions for AI Demo Presentation
 * Based on phase1-scripts.md
 */

export interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  content: string[];
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  duration: number; // seconds
  animation?: 'fade' | 'slide' | 'zoom';
}

export const demoSlides: SlideData[] = [
  // Slide 1: The Problem
  {
    id: 1,
    title: "The Problem",
    subtitle: "2:47 AM • Denver, Colorado",
    content: [
      "Water heater burst",
      "Customer panicking",
      "Called Bob's HVAC",
      "Got voicemail",
      "",
      "Called next company on Google",
      "They picked up",
      "",
      "Bob lost $4,200",
      "Actually lost $28,000 lifetime value",
    ],
    backgroundColor: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    textColor: "#e0e0e0",
    duration: 60,
    animation: 'fade',
  },

  // Slide 2: Industry Reality
  {
    id: 2,
    title: "Industry Reality",
    subtitle: "2024 HVAC Industry Study",
    content: [
      "Average HVAC company misses:",
      "",
      "📞 30% of calls during business hours",
      "📞 90% of calls after hours",
      "",
      "But here's what's wild:",
      "",
      "🔥 After-hours emergencies = HIGHEST MARGIN",
      "",
      "You're sleeping through your most profitable leads",
    ],
    backgroundColor: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    textColor: "#e0e0e0",
    duration: 45,
    animation: 'fade',
  },

  // Slide 3: Old Solutions Don't Work
  {
    id: 3,
    title: "Old Solutions Don't Work",
    content: [
      "❌ Answering Services",
      "   → Expensive voicemail",
      "   → Customer calls next company",
      "",
      "❌ Hiring Someone",
      "   → $40K/year + benefits",
      "   → Still needs to sleep",
      "",
      "❌ On-Call Rotation",
      "   → Techs resent it",
      "   → Families hate it",
      "   → Grumpy at 3 AM = bad CX",
      "",
      "None of these actually solve the problem",
    ],
    backgroundColor: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    textColor: "#e0e0e0",
    duration: 45,
    animation: 'fade',
  },

  // Slide 4: THE SOLUTION
  {
    id: 4,
    title: "What if your phone...",
    subtitle: "",
    content: [
      "",
      "",
      "...just answered itself?",
      "",
      "",
      "No hiring • No training • No payroll",
      "24/7 • 365 days • Every single call",
    ],
    backgroundColor: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    textColor: "#00FFB4",
    duration: 90,
    animation: 'zoom',
  },

  // Slide 5: How It Works
  {
    id: 5,
    title: "How It Works",
    content: [
      "1️⃣ Customer calls",
      "   → AI answers in <1 second",
      "",
      "2️⃣ Emergency?",
      "   → Instant transfer to on-call tech",
      "   → Customer never knows it was AI",
      "",
      "3️⃣ Book appointment?",
      "   → AI checks calendar real-time",
      "   → Books next available slot",
      "   → Sends confirmation text",
      "",
      "Done. While you're eating lunch.",
    ],
    backgroundColor: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    textColor: "#e0e0e0",
    duration: 120,
    animation: 'slide',
  },

  // Slide 6: Why We're Different
  {
    id: 6,
    title: "Why We're Different",
    subtitle: "Competitors vs Warlord",
    content: [
      "Other AI Phone Systems:",
      "❌ 2-3 second response delay",
      "❌ Robotic voice",
      "❌ YOU have to set it up",
      "",
      "Warlord:",
      "✅ 200ms response (faster than humans)",
      "✅ Natural voice (can't tell it's AI)",
      "✅ WE build it custom for you",
      "",
      "Your hours • Your services • Your pricing",
    ],
    backgroundColor: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    textColor: "#e0e0e0",
    duration: 60,
    animation: 'fade',
  },

  // Slide 7: ONE MORE THING
  {
    id: 7,
    title: "One More Thing...",
    content: [
      "Every call your AI takes?",
      "It learns from it.",
      "",
      "📊 Full transcripts",
      "📊 Sentiment analysis",
      "📊 Intent categorization",
      "📊 Call volume patterns",
      "",
      "You finally get data on the one channel",
      "that's been a black box:",
      "",
      "Your phone line.",
    ],
    backgroundColor: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    textColor: "#00FFB4",
    duration: 90,
    animation: 'zoom',
  },

  // Slide 8: Real Results
  {
    id: 8,
    title: "Real Results",
    content: [
      "Bob's HVAC • Denver",
      "✅ 31 after-hours calls captured (Month 1)",
      "✅ $18,400 additional revenue",
      "✅ Paid for itself in Week 1",
      "",
      "Maria's HVAC • Phoenix",
      "✅ 0 missed calls in 90 days",
      "✅ Customer satisfaction: 4.3 → 4.9",
      "",
      "This isn't an outlier.",
      "This is normal.",
    ],
    backgroundColor: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
    textColor: "#e0e0e0",
    duration: 60,
    animation: 'fade',
  },
];

/**
 * Get total presentation duration
 */
export function getTotalDuration(): number {
  return demoSlides.reduce((total, slide) => total + slide.duration, 0);
}

/**
 * Get slide by ID
 */
export function getSlideById(id: number): SlideData | undefined {
  return demoSlides.find(slide => slide.id === id);
}

/**
 * Get slide transition timestamps
 */
export function getSlideTransitions(): number[] {
  const transitions: number[] = [];
  let currentTime = 0;
  
  demoSlides.forEach(slide => {
    transitions.push(currentTime);
    currentTime += slide.duration;
  });
  
  return transitions;
}
