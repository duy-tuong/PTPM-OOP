import { getServicePlans } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { PlanPricingGrid } from "@/components/home/PlanPricingGrid";

export async function FeaturedPlansSection() {
  const plans = await safeFetch(async () => {
    const featured = await getServicePlans({ isFeatured: true, pageSize: 3 }, { revalidate: 1800 });
    if (featured.items.length > 0) return featured.items;
    return (await getServicePlans({ pageSize: 3 }, { revalidate: 1800 })).items;
  }, []);

  if (plans.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-16">
      <ScrollReveal className="mb-10 flex flex-col gap-4 text-center">
        <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">Gói dịch vụ nổi bật</h2>
        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
          Lựa chọn cấu hình phù hợp với nhu cầu của bạn.
        </p>
      </ScrollReveal>

      <PlanPricingGrid plans={plans} />
    </section>
  );
}