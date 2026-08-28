import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminServiceCategories } from "@/lib/api/admin/service-categories";
import { getAdminAddons } from "@/lib/api/admin/addons";
import { getAdminOsImages } from "@/lib/api/admin/os-images";
import { getRegions } from "@/lib/api/catalog";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ServicePlanForm } from "@/components/admin/service-plans/ServicePlanForm";

export const metadata: Metadata = {
  title: "Thêm gói dịch vụ",
};

export default async function AdminNewServicePlanPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  // pageSize lớn để lấy gần như toàn bộ danh mục/addon/OS image cho các <Select> chọn trong form - dự
  // án quy mô nhỏ, chưa cần endpoint "lấy tất cả không phân trang" riêng cho việc này.
  const [categories, regions, addons, osImages] = await Promise.all([
    getAdminServiceCategories(getApiUrl(), { pageSize: 100 }, token),
    getRegions(),
    getAdminAddons(getApiUrl(), { pageSize: 100 }, token),
    getAdminOsImages(getApiUrl(), { pageSize: 100 }, token),
  ]);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Thêm gói dịch vụ</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Điền thông tin cơ bản, tính năng và mức giá cho gói mới.</p>
        </div>
        <ServicePlanForm mode="create" categories={categories.items} regions={regions} availableAddons={addons.items} availableOsImages={osImages.items} />
      </div>
    </div>
  );
}
