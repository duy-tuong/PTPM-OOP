import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminOsImages } from "@/lib/api/admin/os-images";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { OsImagesManager } from "@/components/admin/os-images/OsImagesManager";

export const metadata: Metadata = {
  title: "Quản lý hệ điều hành",
};

export default async function AdminOsImagesPage() {
  // GET /admin/os-images chỉ [Authorize(Roles="Admin")] - chặn trước khi gọi API, khớp trang addons.
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const osImages = await getAdminOsImages(getApiUrl(), token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <OsImagesManager osImages={osImages} />
      </div>
    </div>
  );
}
