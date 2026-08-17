import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminPromotions } from "@/lib/api/admin/promotions";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { PromotionsManager } from "@/components/admin/promotions/PromotionsManager";

export const metadata: Metadata = {
  title: "Quản lý khuyến mãi",
};

export default async function AdminPromotionsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const promotions = await getAdminPromotions(getApiUrl(), token);

  return (
    <div className="min-h-full bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-gray-900">Khuyến mãi</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý mã giảm giá áp dụng khi khách đặt dịch vụ.</p>
        </div>
        <PromotionsManager promotions={promotions} />
      </div>
    </div>
  );
}
