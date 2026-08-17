import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ServiceCategoriesManager } from "@/components/admin/service-categories/ServiceCategoriesManager";

export const metadata: Metadata = {
  title: "Quản lý danh mục dịch vụ",
};

export default async function AdminServiceCategoriesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const categories = await getAdminServiceCategories(getApiUrl(), token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <ServiceCategoriesManager categories={categories} />
      </div>
    </div>
  );
}
