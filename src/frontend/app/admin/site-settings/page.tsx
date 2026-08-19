import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminSiteSettings } from "@/lib/api/admin/site-settings";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { SiteSettingsManager } from "@/components/admin/site-settings/SiteSettingsManager";

export const metadata: Metadata = {
  title: "Cài đặt hệ thống",
};

export default async function AdminSiteSettingsPage() {
  // GET /admin/site-settings chỉ [Authorize(Roles="Admin")] - chặn trước khi gọi API.
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const settings = await getAdminSiteSettings(baseUrl, token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <SiteSettingsManager settings={settings} />
      </div>
    </div>
  );
}
