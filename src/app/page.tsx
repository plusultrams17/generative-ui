import { HeroSection } from "@/components/landing/hero-section";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { TemplateGallery } from "@/components/landing/template-gallery";
import { UseCaseSection } from "@/components/landing/use-case-section";
import { StatsSection } from "@/components/landing/stats-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeatureShowcase />
      <TemplateGallery />
      <UseCaseSection />
      <StatsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
