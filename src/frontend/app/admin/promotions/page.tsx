import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminPromotions } from "@/lib/api/admin/promotions";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { getAdminServicePlans } from "@/lib/api/admin/service-plans";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { PromotionsManager } from "@/components/admin/promotions/PromotionsManager";

export const metadata: Metadata = {
  title: "Quản lý khuyến mãi",
};

export default async function AdminPromotionsPage() {
  // GET /admin/promotions chỉ [Authorize(Roles="Admin")] - chặn trước khi gọi API.
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [promotions, categories, plans] = await Promise.all([
    getAdminPromotions(baseUrl, token),
    getAdminServiceCategories(baseUrl, token),
    // pageSize lớn để lấy gần như toàn bộ gói dịch vụ cho <Select> chọn phạm vi - dự án quy mô nhỏ,
    // chưa cần endpoint "lấy tất cả không phân trang" riêng cho việc này.
    getAdminServicePlans(baseUrl, { pageSize: 100 }, token),
  ]);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <PromotionsManager promotions={promotions} categories={categories} plans={plans.items} />
      </div>
    </div>
  );
}
