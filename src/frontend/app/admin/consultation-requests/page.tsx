import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminConsultationRequests } from "@/lib/api/admin/consultation-requests";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { ConsultationRequestsManager } from "@/components/admin/consultation-requests/ConsultationRequestsManager";

export const metadata: Metadata = {
  title: "Quản lý yêu cầu tư vấn",
};

export default async function AdminConsultationRequestsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const requests = await getAdminConsultationRequests(getApiUrl(), token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Yêu cầu tư vấn</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Quản lý yêu cầu tư vấn từ khách hàng và cập nhật trạng thái xử lý.</p>
        </div>
        <ConsultationRequestsManager requests={requests} />
      </div>
    </div>
  );
}
