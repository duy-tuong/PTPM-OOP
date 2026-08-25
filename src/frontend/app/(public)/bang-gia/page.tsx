import type { Metadata } from "next";
import { getServiceCategories, getServicePlans, getTldPricing, getRegions } from "@/lib/api/catalog";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { PricingMatrixTabs } from "@/components/pricing/PricingMatrixTabs";

export const metadata: Metadata = {
  title: "Bảng giá",
  description: "Bảng giá minh bạch cho toàn bộ dịch vụ VPS, Hosting, Domain và các dịch vụ khác của Cloudverse.",
};

export default async function PricingPage() {
  const [categories, plansResult, tldResult, regions] = await Promise.all([
    safeFetch(() => getServiceCategories({ revalidate: 3600 }), []),
    safeFetch(() => getServicePlans({ pageSize: 100 }, { revalidate: 900 }), emptyPagedResult(100)),
    safeFetch(() => getTldPricing({ pageSize: 100 }, { revalidate: 3600 }), emptyPagedResult(100)),
    safeFetch(() => getRegions({ revalidate: 3600 }), []),
  ]);
  const sortedCategories = [...categories].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">Minh Bạch Mọi Chi Phí</h1>
      </div>

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
  );
}
