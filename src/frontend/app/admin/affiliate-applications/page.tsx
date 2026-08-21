import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminAffiliateApplications } from "@/lib/api/admin/affiliate-applications";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { AffiliateApplicationsManager } from "@/components/admin/affiliate-applications/AffiliateApplicationsManager";

export const metadata: Metadata = {
  title: "Quản lý đăng ký affiliate",
};

export default async function AdminAffiliateApplicationsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const applications = await getAdminAffiliateApplications(getApiUrl(), token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Đăng ký affiliate</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Duyệt đăng ký trở thành đối tác tiếp thị liên kết.</p>
        </div>
        <AffiliateApplicationsManager applications={applications} />
      </div>
    </div>
  );
}
