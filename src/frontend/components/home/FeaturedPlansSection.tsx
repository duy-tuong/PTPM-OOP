import { getServicePlans } from "@/lib/api/catalog";
import { safeFetch } from "@/lib/api/safe";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { PlanPricingGrid } from "@/components/home/PlanPricingGrid";

// Section 4/9 của Trang chủ (pivot 2 - theme "Cloudverse"). Thay 3 card Starter/Professional/Enterprise
// giá USD + thông số bịa (2 vCPU/4GB RAM...) của bản Stitch gốc bằng gói dịch vụ thật (VND). Đây là
// spotlight teaser (không phải bảng so sánh đầy đủ - dành cho trang /bang-gia riêng). Toggle Hàng
// tháng/Hàng năm + danh sách tính năng nằm trong `PlanPricingGrid` (client component, cần useState).
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
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-12 flex flex-col gap-4 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">Gói Dịch Vụ Nổi Bật</h2>
        <p className="mx-auto max-w-[600px] text-lg text-muted-foreground">
          Lựa chọn phù hợp cho hiệu năng và quy mô của bạn.
        </p>
      </ScrollReveal>

      <PlanPricingGrid plans={plans} />
    </section>
  );
}