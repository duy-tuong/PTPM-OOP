import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ServicePlanForm } from "@/components/admin/service-plans/ServicePlanForm";

export const metadata: Metadata = {
  title: "Thêm gói dịch vụ",
};

export default async function AdminNewServicePlanPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const categories = await getAdminServiceCategories(getApiUrl(), token);

  return (
    <div className="min-h-full bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-gray-900">Thêm gói dịch vụ</h1>
          <p className="mt-1 text-sm text-gray-500">Điền thông tin cơ bản, tính năng và mức giá cho gói mới.</p>
        </div>
        <ServicePlanForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
