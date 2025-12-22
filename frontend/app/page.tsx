import Hero from '@/components/Hero';
import ProblemSection from '@/components/ProblemSection';
import DifferentiatorSection from '@/components/DifferentiatorSection';
import CustomBuildSection from '@/components/CustomBuildSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import PricingSection from '@/components/PricingSection';
import ROICalculatorSection from '@/components/ROICalculatorSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FinalCTA from '@/components/FinalCTA';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <ProblemSection />
      <DifferentiatorSection />
      <CustomBuildSection />
      <HowItWorksSection />
      <PricingSection />
      <ROICalculatorSection />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
