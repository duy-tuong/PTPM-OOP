import { HeroSection } from "@/components/home/HeroSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { ServicesBentoSection } from "@/components/home/ServicesBentoSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { FeaturedPlansSection } from "@/components/home/FeaturedPlansSection";
import { PromotionBannerSection } from "@/components/home/PromotionBannerSection";
import { TestimonialsGridSection } from "@/components/home/TestimonialsGridSection";
import { NewsFaqSection } from "@/components/home/NewsFaqSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <ServicesBentoSection />
      <FeaturesSection />
      <FeaturedPlansSection />
      <PromotionBannerSection />
      <TestimonialsGridSection />
      <NewsFaqSection />
      <FinalCtaSection />
    </>
  );
}
