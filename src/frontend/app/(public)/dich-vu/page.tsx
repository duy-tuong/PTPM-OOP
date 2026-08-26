import type { Metadata } from "next";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getServiceCategories, getServicePlans, getRegions, getTldPricing } from "@/lib/api/catalog";
import { getFaqs } from "@/lib/api/content";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { Button } from "@/components/ui/button";
import { FaqColumn } from "@/components/home/FaqColumn";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";
import { ServicesCommandCenter } from "@/components/services/ServicesCommandCenter";
import { ServiceWhyChooseFeatures } from "@/components/services/ServiceWhyChooseFeatures";
import { ServiceComparisonTable } from "@/components/services/ServiceComparisonTable";
import { ServiceProcessSteps } from "@/components/services/ServiceProcessSteps";
import { ServiceInfrastructureStats } from "@/components/services/ServiceInfrastructureStats";

export const metadata: Metadata = {
  title: "Dịch vụ",
  description:
    "VPS, Hosting, Domain, Email doanh nghiệp và giải pháp bảo mật — tất cả được quản lý trên một nền tảng Cloudverse.",
};

// Trang chỉ mục "Dịch vụ" (Đợt 4) - fetch 1 lần duy nhất (Promise.all) mọi dữ liệu cần cho các section
// phía dưới, không lặp lại request cho từng component con. Mỗi section chỉ render nếu có đủ dữ liệu
// thật phù hợp (xem comment riêng từng component) - không có section nào dùng dữ liệu bịa.
export default async function ServicesPage() {
  const [categories, plansResult, faqs, regions, tldResult] = await Promise.all([
    safeFetch(() => getServiceCategories({ revalidate: 3600 }), []),
    safeFetch(() => getServicePlans({ pageSize: 100 }, { revalidate: 900 }), emptyPagedResult(100)),
    safeFetch(() => getFaqs(undefined, { revalidate: 3600 }), []),
    safeFetch(() => getRegions({ revalidate: 3600 }), []),
    safeFetch(() => getTldPricing({ pageSize: 1 }, { revalidate: 3600 }), emptyPagedResult(1)),
  ]);

  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  const plans = plansResult.items;

  const planCountByCategory = new Map<string, number>();
  plans.forEach((plan) => {
    planCountByCategory.set(plan.categorySlug, (planCountByCategory.get(plan.categorySlug) ?? 0) + 1);
  });

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">Một nền tảng. Toàn bộ hạ tầng.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          VPS, Hosting, Domain, Email doanh nghiệp và giải pháp bảo mật — tất cả được quản lý trên một nền tảng.
        </p>
        {sortedCategories.length > 0 && (
          <Button
            className="mt-6 gap-2"
            nativeButton={false}
            render={
              <a href="#danh-muc">
                Khám phá dịch vụ
                <ArrowRight className="size-4" />
              </a>
            }
          />
        )}
      </div>

      {sortedCategories.length > 0 ? (
        <>
          <div id="danh-muc" className="mx-auto max-w-3xl scroll-mt-24 px-4 pb-10 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Bạn đang cần giải pháp nào?
            </span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Hệ sinh thái dịch vụ Cloudverse
            </h2>
          </div>
          <ServicesCommandCenter categories={sortedCategories} planCountByCategory={planCountByCategory} />
        </>
      ) : (
        <p className="mx-auto max-w-7xl px-4 py-12 text-center text-muted-foreground sm:px-6 lg:px-8">
          Chưa có danh mục dịch vụ nào.
        </p>
      )}

      <ServiceWhyChooseFeatures plans={plans} />

      <ServiceComparisonTable
        categories={sortedCategories}
        plans={plans}
        hasDomainPricing={tldResult.totalCount > 0}
      />

      <ServiceProcessSteps />

      <ServiceInfrastructureStats
        regions={regions}
        plans={plans}
        totalPlanCount={plansResult.totalCount}
        categoryCount={sortedCategories.length}
      />

      {faqs.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <FaqColumn faqs={faqs} />
        </div>
      )}

      <FinalCtaSection />
    </>
  );
}
