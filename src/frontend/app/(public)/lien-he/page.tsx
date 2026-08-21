import type { Metadata } from "next";
import { getServiceCategories, getServicePlans, getPromotions } from "@/lib/api/catalog";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrderRequestForm } from "@/components/contact/OrderRequestForm";
import { ConsultationRequestForm } from "@/components/contact/ConsultationRequestForm";

export const metadata: Metadata = {
  title: "Liên hệ / Đặt dịch vụ",
  description: "Đặt dịch vụ hoặc gửi yêu cầu tư vấn miễn phí từ đội ngũ Cloudverse.",
};

// Đích CTA "Đặt dịch vụ" duy nhất toàn site (9+ nơi trỏ tới). Đọc searchParams server-side (đúng
// convention /tin-tuc/page.tsx) để resolve plan/promotion thật trước khi render form - không có
// endpoint GET-by-id cho ServicePlan/Promotion nên fetch nguyên danh sách rồi tìm theo id/code (đúng
// cách PricingMatrixTabs.tsx đã làm cho plan). ?intent=tu-van quyết định tab mặc định.
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string; promotionCode?: string; intent?: string }>;
}) {
  const params = await searchParams;

  const [plansResult, promotions, categories] = await Promise.all([
    safeFetch(() => getServicePlans({ pageSize: 100 }, { revalidate: 900 }), emptyPagedResult(100)),
    safeFetch(() => getPromotions({ revalidate: 300 }), []),
    safeFetch(() => getServiceCategories({ revalidate: 3600 }), []),
  ]);

  const plans = plansResult.items;
  const planId = Number(params.planId);
  const defaultPlan = Number.isFinite(planId) ? (plans.find((p) => p.id === planId) ?? null) : null;
  const promotion = params.promotionCode ? (promotions.find((p) => p.code === params.promotionCode) ?? null) : null;
  const defaultTab = params.intent === "tu-van" ? "tu-van" : "dat-dich-vu";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">Liên Hệ</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Đặt dịch vụ ngay hoặc để lại thông tin, đội ngũ Cloudverse sẽ tư vấn miễn phí cho bạn.
        </p>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="mx-auto mb-8 grid w-full grid-cols-2">
          <TabsTrigger value="dat-dich-vu">Đặt dịch vụ</TabsTrigger>
          <TabsTrigger value="tu-van">Tư vấn miễn phí</TabsTrigger>
        </TabsList>

        <TabsContent value="dat-dich-vu">
          {plans.length > 0 ? (
            <OrderRequestForm plans={plans} defaultPlan={defaultPlan} promotion={promotion} />
          ) : (
            <p className="text-center text-muted-foreground">Chưa có gói dịch vụ nào để đặt.</p>
          )}
        </TabsContent>

        <TabsContent value="tu-van">
          <ConsultationRequestForm categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
