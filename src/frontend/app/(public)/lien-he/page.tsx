import type { Metadata } from "next";
import { getServiceCategories, getServicePlans, getPromotions, getTldPricing } from "@/lib/api/catalog";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrderRequestForm } from "@/components/contact/OrderRequestForm";
import { DomainOrderForm } from "@/components/contact/DomainOrderForm";
import { ConsultationRequestForm } from "@/components/contact/ConsultationRequestForm";

export const metadata: Metadata = {
  title: "Liên hệ / Đặt dịch vụ",
  description: "Đặt dịch vụ hoặc gửi yêu cầu tư vấn miễn phí từ đội ngũ Cloudverse.",
};

// Đích CTA "Đặt dịch vụ"/"Đặt mua" (tên miền) duy nhất toàn site. Đọc searchParams server-side (đúng
// convention /tin-tuc/page.tsx) để resolve plan/tldPricing/promotion thật trước khi render form - không
// có endpoint GET-by-id cho ServicePlan/TldPricing/Promotion nên fetch nguyên danh sách rồi tìm theo
// id/code (đúng cách PricingMatrixTabs.tsx đã làm cho plan). ?intent=tu-van|ten-mien quyết định tab
// mặc định (DomainPricingTable.tsx trỏ CTA "Đặt mua" về ?intent=ten-mien&tldPricingId=).
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{
    planId?: string;
    tldPricingId?: string;
    domainName?: string;
    promotionCode?: string;
    intent?: string;
  }>;
}) {
  const params = await searchParams;

  const [plansResult, tldResult, promotions, categories] = await Promise.all([
    safeFetch(() => getServicePlans({ pageSize: 100 }, { revalidate: 900 }), emptyPagedResult(100)),
    safeFetch(() => getTldPricing({ pageSize: 100 }, { revalidate: 3600 }), emptyPagedResult(100)),
    safeFetch(() => getPromotions({ revalidate: 300 }), []),
    safeFetch(() => getServiceCategories({ revalidate: 3600 }), []),
  ]);

  const plans = plansResult.items;
  const tldPricing = tldResult.items;
  const planId = Number(params.planId);
  const defaultPlan = Number.isFinite(planId) ? (plans.find((p) => p.id === planId) ?? null) : null;
  const tldPricingId = Number(params.tldPricingId);
  const defaultTldPricing = Number.isFinite(tldPricingId) ? (tldPricing.find((t) => t.id === tldPricingId) ?? null) : null;
  const promotion = params.promotionCode ? (promotions.find((p) => p.code === params.promotionCode) ?? null) : null;
  const defaultTab =
    params.intent === "tu-van" ? "tu-van" : params.intent === "ten-mien" ? "dat-ten-mien" : "dat-dich-vu";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">Liên Hệ</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Đặt dịch vụ ngay hoặc để lại thông tin, đội ngũ Cloudverse sẽ tư vấn miễn phí cho bạn.
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mx-auto mb-8 grid w-full grid-cols-3">
          <TabsTrigger value="dat-dich-vu">Đặt dịch vụ</TabsTrigger>
          <TabsTrigger value="dat-ten-mien">Đặt tên miền</TabsTrigger>
          <TabsTrigger value="tu-van">Tư vấn miễn phí</TabsTrigger>
        </TabsList>

        <TabsContent value="dat-dich-vu">
          {plans.length > 0 ? (
            <OrderRequestForm plans={plans} defaultPlan={defaultPlan} promotion={promotion} />
          ) : (
            <p className="text-center text-muted-foreground">Chưa có gói dịch vụ nào để đặt.</p>
          )}
        </TabsContent>

        <TabsContent value="dat-ten-mien">
          <DomainOrderForm
            tldPricing={tldPricing}
            defaultTldPricing={defaultTldPricing}
            defaultDomainName={params.domainName ?? ""}
            promotion={promotion}
          />
        </TabsContent>

        <TabsContent value="tu-van">
          <ConsultationRequestForm categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
