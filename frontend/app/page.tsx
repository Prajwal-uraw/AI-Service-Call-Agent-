"use client";

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import AnimatedSection from "@/components/AnimatedSection";
import SocialProofSection from "@/components/SocialProofSection";
import FeaturesSection from "@/components/FeaturesSection";
import ProblemSection from "@/components/ProblemSection";
import ProductDemoSection from "@/components/ProductDemoSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import IntegrationSection from "@/components/IntegrationSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        <Hero />
        <AnimatedSection animation="fade-in">
          <SocialProofSection />
        </AnimatedSection>
        <AnimatedSection animation="fade-in" delay={100}>
          <FeaturesSection />
        </AnimatedSection>
        <AnimatedSection animation="slide-in-left" delay={100}>
          <ProblemSection />
        </AnimatedSection>
        <AnimatedSection animation="fade-in" delay={100}>
          <ProductDemoSection />
        </AnimatedSection>
        <AnimatedSection animation="fade-in" delay={100}>
          <HowItWorksSection />
        </AnimatedSection>
        <AnimatedSection animation="fade-in" delay={100}>
          <IntegrationSection />
        </AnimatedSection>
        <AnimatedSection animation="fade-in" delay={100}>
          <PricingSection />
        </AnimatedSection>
        <AnimatedSection animation="fade-in" delay={100}>
          <FAQSection />
        </AnimatedSection>
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}
