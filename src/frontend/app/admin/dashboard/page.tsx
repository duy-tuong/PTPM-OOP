import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminDashboardStats } from "@/lib/api/admin/dashboard";
import { getAdminOrderRequests } from "@/lib/api/admin/order-requests";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AdminDashboardView } from "@/components/admin/dashboard/AdminDashboardView";
import { EditorDashboardView } from "@/components/admin/dashboard/EditorDashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
};

const TODAY_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

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

  let stats: any = { totalCustomers: 0, activeServices: 0, pendingOrders: 0, monthlyRevenue: 0 };
  let recentOrders: any = [];

  try {
    const [statsRes, ordersRes] = await Promise.all([
      getAdminDashboardStats(baseUrl, token),
      getAdminOrderRequests(baseUrl, { pageSize: 5 }, token),
    ]);
    stats = statsRes;
    recentOrders = ordersRes;
  } catch {
    // Gracefully handle backend API errors
  }

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        {headerBlock}
        <AdminDashboardView stats={stats} recentOrders={recentOrders} />
      </div>
    </div>
  );
}
