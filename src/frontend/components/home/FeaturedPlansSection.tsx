import { ScrollReveal } from "@/components/home/ScrollReveal";
import { PlanPricingGrid } from "@/components/home/PlanPricingGrid";

export function FeaturedPlansSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-12 flex flex-col gap-4 text-center">
        <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Gói dịch vụ nổi bật</h2>
        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
          Lựa chọn cấu hình phù hợp với nhu cầu của bạn.
        </p>
      </ScrollReveal>

      <PlanPricingGrid />
    </section>
  );
}