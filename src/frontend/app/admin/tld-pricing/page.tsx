import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminTldPricing } from "@/lib/api/admin/tld-pricing";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { TldPricingManager } from "@/components/admin/tld-pricing/TldPricingManager";

export const metadata: Metadata = {
  title: "Quản lý bảng giá tên miền",
};

export default async function AdminTldPricingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [tldPricing, categories] = await Promise.all([
    getAdminTldPricing(baseUrl, token),
    getAdminServiceCategories(baseUrl, token),
  ]);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <TldPricingManager tldPricing={tldPricing} categories={categories} />
      </div>
    </div>
  );
}
