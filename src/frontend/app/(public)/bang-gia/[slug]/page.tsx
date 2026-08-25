import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServicePlanBySlug, getServiceCategoryBySlug } from "@/lib/api/catalog";
import { getFaqs } from "@/lib/api/content";
import { safeFetch } from "@/lib/api/safe";
import { ApiError } from "@/lib/api/http";
import { PlanDetailHero } from "@/components/pricing/PlanDetailHero";
import { PlanDetailContent } from "@/components/pricing/PlanDetailContent";
import { PlanFloatingBuyBar } from "@/components/pricing/PlanFloatingBuyBar";
import { FaqColumn } from "@/components/home/FaqColumn";
import { computeCustomPlanUnitPrice } from "@/lib/pricing/customPlanPricing";
import type { ServicePlanDetailDto } from "@/lib/types/catalog";

// Fetch theo slug KHÔNG bọc safeFetch (khác các fetch phụ bên dưới) - xem comment lib/api/safe.ts:
// trang chi tiết theo slug phải báo lỗi rõ ràng (notFound cho 404 thật) chứ không âm thầm ẩn dữ liệu
// thiếu. Mirror đúng loadCategory() ở dich-vu/[categorySlug]/page.tsx.
async function loadPlan(slug: string): Promise<ServicePlanDetailDto> {
  try {
    return await getServicePlanBySlug(slug, { revalidate: 900 });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const plan = await getServicePlanBySlug(slug, { revalidate: 900 });
    return { title: plan.name, description: plan.shortDescription ?? plan.description ?? undefined };
  } catch {
    return {};
  }
}

export default async function PlanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = await loadPlan(slug);

  // getFaqs() cần serviceCategoryId dạng số - plan chỉ có categorySlug, nên fetch thêm category.
  const category = await safeFetch(() => getServiceCategoryBySlug(plan.categorySlug, { revalidate: 3600 }), null);
  const faqs = category ? await safeFetch(() => getFaqs(category.id, { revalidate: 3600 }), []) : [];

  const defaultPrice = plan.prices.find((p) => p.isDefault) ?? plan.prices[0] ?? null;
  // Custom: "giá từ" ở cấu hình TỐI THIỂU - dùng ĐÚNG công thức với lúc tính giá bán thật (xem
  // ServicePlanService.ComputeStartingPrice ở backend), tránh hiển thị 1 giá nhưng lúc mua tính khác.
  const floatingPrice =
    !defaultPrice
      ? null
      : plan.packageType === "Custom"
        ? plan.minVcpu != null && plan.minRamMb != null && plan.minDiskGb != null
          ? computeCustomPlanUnitPrice(plan, plan.minVcpu, plan.minRamMb, plan.minDiskGb, defaultPrice.periodMonths, defaultPrice.discountPercent)
          : null
        : (defaultPrice.promotionalPrice ?? defaultPrice.price);

  return (
    <>
      <PlanDetailHero plan={plan} />
      <PlanDetailContent plan={plan} />

      {faqs.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:px-8">
          <FaqColumn faqs={faqs} />
        </div>
      )}

      <PlanFloatingBuyBar plan={plan} price={floatingPrice} />
    </>
  );
}
