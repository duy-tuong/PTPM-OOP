import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminAddons } from "@/lib/api/admin/addons";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { AddonsManager } from "@/components/admin/addons/AddonsManager";

export const metadata: Metadata = {
  title: "Quản lý tiện ích mua kèm",
};

export default async function AdminAddonsPage() {
  // GET /admin/addons chỉ [Authorize(Roles="Admin")] - chặn trước khi gọi API, khớp trang
  // service-categories.
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const addons = await getAdminAddons(getApiUrl(), token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <AddonsManager addons={addons} />
      </div>
    </div>
  );
}
