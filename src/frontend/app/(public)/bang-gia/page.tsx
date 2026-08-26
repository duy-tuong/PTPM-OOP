import type { Metadata } from "next";
import { getServiceCategories, getServicePlans, getTldPricing, getRegions } from "@/lib/api/catalog";
import { getFaqs } from "@/lib/api/content";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { PricingMatrixTabs } from "@/components/pricing/PricingMatrixTabs";
import { RegionAvailabilityStrip } from "@/components/pricing/RegionAvailabilityStrip";
import { ServiceWhyChooseFeatures } from "@/components/services/ServiceWhyChooseFeatures";
import { PromotionBannerSection } from "@/components/home/PromotionBannerSection";
import { FaqColumn } from "@/components/home/FaqColumn";

export const metadata: Metadata = {
  title: "Bảng giá",
  description: "Bảng giá minh bạch cho toàn bộ dịch vụ VPS, Hosting, Domain và các dịch vụ khác của Cloudverse.",
};

// Đợt 5 - fetch 1 lần duy nhất (Promise.all) mọi dữ liệu cần cho các section phía dưới. Mỗi section
// mới (Promotion/WhyChoose/FAQ) tự ẩn nếu không đủ dữ liệu thật (xem comment riêng từng component) -
// không có section nào dùng dữ liệu bịa.
export default async function PricingPage() {
  const [categories, plansResult, tldResult, regions, faqs] = await Promise.all([
    safeFetch(() => getServiceCategories({ revalidate: 3600 }), []),
    safeFetch(() => getServicePlans({ pageSize: 100 }, { revalidate: 900 }), emptyPagedResult(100)),
    safeFetch(() => getTldPricing({ pageSize: 100 }, { revalidate: 3600 }), emptyPagedResult(100)),
    safeFetch(() => getRegions({ revalidate: 3600 }), []),
    safeFetch(() => getFaqs(undefined, { revalidate: 3600 }), []),
  ]);
  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">Minh Bạch Mọi Chi Phí</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Không phí ẩn, không cam kết dài hạn — xem giá thật cho mọi cấu hình.
          </p>
        </div>
      </section>

      <RegionAvailabilityStrip regions={regions} />

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {sortedCategories.length > 0 ? (
          <PricingMatrixTabs
            categories={sortedCategories}
            plans={plansResult.items}
            tldPricing={tldResult.items}
            regions={regions}
          />
        ) : (
          <p className="text-center text-muted-foreground">Chưa có danh mục dịch vụ nào.</p>
        )}
      </div>

      <PromotionBannerSection />

      <ServiceWhyChooseFeatures plans={plansResult.items} />

      {faqs.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <FaqColumn faqs={faqs} />
        </div>
      )}
    </>
  );
}
