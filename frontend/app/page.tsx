"use client";

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import DifferentiatorSection from "@/components/DifferentiatorSection";
import CustomBuildSection from "@/components/CustomBuildSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import PricingSection from "@/components/PricingSection";
import ROICalculatorSection from "@/components/ROICalculatorSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
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
      </div>
    </>
  );
}
