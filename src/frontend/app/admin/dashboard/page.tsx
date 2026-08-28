import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminDashboardStats } from "@/lib/api/admin/dashboard";
import { getAdminOrderRequests } from "@/lib/api/admin/order-requests";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AdminDashboardView } from "@/components/admin/dashboard/AdminDashboardView";
import { EditorDashboardView } from "@/components/admin/dashboard/EditorDashboardView";
import { safeFetch, emptyPagedResult } from "@/lib/api/safe";
import type { DashboardStatsDto } from "@/lib/types/admin";

export const metadata: Metadata = {
  title: "Dashboard",
};

const TODAY_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

// Fallback đúng SHAPE thật của DashboardStatsDto (khớp lib/types/admin.ts) - trước đây fallback là
// `any` với field bịa (totalCustomers/activeServices/...) không tồn tại trong DTO thật, khiến
// AdminDashboardView crash ngay khi backend tạm lỗi (đọc stats.monthlyStats.length trên object không
// có field này). safeFetch (đã dùng cho trang public, xem lib/api/safe.ts) vừa log lỗi thật ra console
// server vừa trả fallback đúng kiểu, không còn nuốt lỗi âm thầm như try/catch cũ.
const EMPTY_DASHBOARD_STATS: DashboardStatsDto = {
  totalOrderRequests: 0,
  totalConsultationRequests: 0,
  totalAffiliateApplications: 0,
  pendingOrderRequests: 0,
  monthlyStats: [],
  topServicePlans: [],
};

import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const isAdmin = session.roles.includes("Admin");

  const headerBlock = (
    <div>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-zinc-900">Tổng quan</h1>
      <p className="mt-2 text-sm text-zinc-500 capitalize">{TODAY_FORMATTER.format(new Date())}</p>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
          {headerBlock}
          <EditorDashboardView />
        </div>
      </div>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [stats, recentOrders] = await Promise.all([
    safeFetch(() => getAdminDashboardStats(baseUrl, token), EMPTY_DASHBOARD_STATS),
    safeFetch(() => getAdminOrderRequests(baseUrl, { pageSize: 5 }, token), emptyPagedResult(5)),
  ]);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        {headerBlock}
        <AdminDashboardView stats={stats} recentOrders={recentOrders} />
      </div>
    </div>
  );
}
