import { HeroSection } from "@/components/home/HeroSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ServicesBentoSection } from "@/components/home/ServicesBentoSection";
import { FeaturedPlansSection } from "@/components/home/FeaturedPlansSection";
import { PromotionBannerSection } from "@/components/home/PromotionBannerSection";
import { TestimonialsGridSection } from "@/components/home/TestimonialsGridSection";
import { NewsFaqSection } from "@/components/home/NewsFaqSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { CloudDataFlowBackground } from "@/components/home/effects/CloudDataFlowBackground";

export default function HomePage() {
  return (
    <>
      <CloudDataFlowBackground />
      <HeroSection />
      <TrustStrip />
      <ServicesBentoSection />
      <FeaturedPlansSection />
      <PromotionBannerSection />
      <TestimonialsGridSection />
      <NewsFaqSection />
      <FinalCtaSection />
    </>
  );
}
