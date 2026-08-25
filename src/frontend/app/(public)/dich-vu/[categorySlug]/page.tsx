import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServiceCategoryBySlug, getServicePlans, getRegions } from "@/lib/api/catalog";
import { getFaqs } from "@/lib/api/content";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { ApiError } from "@/lib/api/http";
import { PlanPricingGrid } from "@/components/home/PlanPricingGrid";
import { RegionFilterBar } from "@/components/pricing/RegionFilterBar";
import { FaqColumn } from "@/components/home/FaqColumn";
import { ServiceCategoryHero } from "@/components/services/ServiceCategoryHero";
import { ServiceCoreFeatures } from "@/components/services/ServiceCoreFeatures";
import { FloatingBuyBar } from "@/components/services/FloatingBuyBar";
import type { ServiceCategoryDto } from "@/lib/types/catalog";

// Trang "chốt sale" theo danh mục (Hero -> Thông số -> Giá -> FAQ + Floating Buy Bar). Fetch category
// theo slug KHÔNG bọc safeFetch (khác các fetch phụ bên dưới) - xem comment lib/api/safe.ts: trang chi
// tiết theo slug phải báo lỗi rõ ràng (notFound cho 404 thật) chứ không âm thầm ẩn dữ liệu thiếu.
async function loadCategory(categorySlug: string): Promise<ServiceCategoryDto> {
  try {
    return await getServiceCategoryBySlug(categorySlug, { revalidate: 3600 });
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
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  try {
    const category = await getServiceCategoryBySlug(categorySlug, { revalidate: 3600 });
    return { title: category.name, description: category.description ?? undefined };
  } catch {
    return {};
  }
}

export default async function ServiceCategoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ regionId?: string }>;
}) {
  const { categorySlug } = await params;
  const { regionId } = await searchParams;
  const category = await loadCategory(categorySlug);

  const [plansResult, faqs, regions] = await Promise.all([
    safeFetch(
      () => getServicePlans({ categorySlug, regionId: regionId || undefined, pageSize: 50 }, { revalidate: 900 }),
      emptyPagedResult(50),
    ),
    safeFetch(() => getFaqs(category.id, { revalidate: 3600 }), []),
    safeFetch(() => getRegions({ revalidate: 3600 }), []),
  ]);
  const plans = plansResult.items;
  const cheapestPrice = Math.min(...plans.map((plan) => plan.startingPrice ?? Infinity));

  return (
    <>
      <ServiceCategoryHero category={category} />
      <ServiceCoreFeatures plans={plans} />

      {plans.length > 0 || regionId ? (
        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center font-heading text-3xl font-bold sm:text-4xl">
            Bảng Giá {category.name}
          </h2>
          {regions.length > 0 && (
            <div className="mb-8 flex justify-center">
              <RegionFilterBar regions={regions} currentRegionId={regionId} />
            </div>
          )}
          {plans.length > 0 ? (
            <PlanPricingGrid plans={plans} />
          ) : (
            <p className="text-center text-muted-foreground">Không có gói dịch vụ nào ở khu vực này.</p>
          )}
        </section>
      ) : (
        <p className="mx-auto max-w-7xl px-4 py-16 text-center text-muted-foreground sm:px-6 lg:px-8">
          Chưa có gói dịch vụ nào cho danh mục này.
        </p>
      )}

      {faqs.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <FaqColumn faqs={faqs} />
        </div>
      )}

      {plans.length > 0 && <FloatingBuyBar category={category} cheapestPrice={cheapestPrice} />}
    </>
  );
}
