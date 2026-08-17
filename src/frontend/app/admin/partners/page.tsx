import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminPartners } from "@/lib/api/admin/partners";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { PartnersManager } from "@/components/admin/partners/PartnersManager";

export const metadata: Metadata = {
  title: "Quản lý đối tác",
};

export default async function AdminPartnersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const partners = await getAdminPartners(getApiUrl(), token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <PartnersManager partners={partners} />
      </div>
    </div>
  );
}
