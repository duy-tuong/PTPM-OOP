import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import {
  getAdminRevenueSummary,
  getAdminRevenueTrend,
  getAdminRevenueByProductLine,
  getAdminRevenueByRegion,
  getAdminArAging,
} from "@/lib/api/admin/revenue-analytics";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RevenueAnalyticsView } from "@/components/admin/revenue/RevenueAnalyticsView";

export const metadata: Metadata = {
  title: "Doanh thu",
};

const TREND_MONTHS = 12;

export default async function AdminRevenuePage() {
  // GET /admin/revenue-analytics/* chỉ [Authorize(Roles="Admin")] - chặn trước khi gọi API, mirror
  // app/admin/users/page.tsx (số liệu doanh thu là dữ liệu nhạy cảm, không cho Editor xem).
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [summary, trend, byProductLine, byRegion, arAging] = await Promise.all([
    getAdminRevenueSummary(baseUrl, token),
    getAdminRevenueTrend(baseUrl, TREND_MONTHS, token),
    getAdminRevenueByProductLine(baseUrl, token),
    getAdminRevenueByRegion(baseUrl, token),
    getAdminArAging(baseUrl, token),
  ]);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-zinc-900">Doanh thu</h1>
          <p className="mt-2 text-sm text-zinc-500">MRR/ARR, xu hướng, doanh thu theo dòng sản phẩm/Region, tuổi nợ đơn chưa thanh toán.</p>
        </div>
        <RevenueAnalyticsView summary={summary} trend={trend} byProductLine={byProductLine} byRegion={byRegion} arAging={arAging} />
      </div>
    </div>
  );
}
