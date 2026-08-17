import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ShoppingCart, MessageSquare, Users, Clock } from "lucide-react";
import { getApiUrl } from "@/lib/api/config";
import { getAdminDashboardStats } from "@/lib/api/admin/dashboard";
import { getAdminOrderRequests } from "@/lib/api/admin/order-requests";
import { ApiError } from "@/lib/api/http";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { MetricCard } from "@/components/admin/MetricCard";
import { MonthlyStatsChart } from "@/components/admin/MonthlyStatsChart";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
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

// Tính % tăng trưởng THẬT từ 2 tháng gần nhất trong monthlyStats (mảng thứ tự cũ->mới, đã xác nhận
// đọc trực tiếp DashboardStatsService.cs) - không bịa số. Trả undefined nếu không tính được (tháng
// trước = 0, chia cho 0).
function computeGrowthPercent(stats: DashboardStatsDto, field: "orderRequestCount" | "consultationRequestCount") {
  const months = stats.monthlyStats;
  if (months.length < 2) return undefined;
  const current = months[months.length - 1][field];
  const previous = months[months.length - 2][field];
  if (previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const [stats, recentOrders] = await Promise.all([
    getAdminDashboardStats(baseUrl, token).catch((error) => {
      // GET /admin/dashboard-stats chỉ [Authorize(Roles="Admin")] - Editor đăng nhập được nhưng
      // không có quyền xem số liệu tổng quan (403), không phải lỗi hệ thống.
      if (error instanceof ApiError && error.status === 403) {
        return null;
      }
      throw error;
    }),
    getAdminOrderRequests(baseUrl, { pageSize: 5 }, token),
  ]);

  return (
    <div className="min-h-full bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500 capitalize">{TODAY_FORMATTER.format(new Date())}</p>
        </div>

        {stats ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Tổng yêu cầu đặt dịch vụ"
                value={stats.totalOrderRequests}
                icon={ShoppingCart}
                growthPercent={computeGrowthPercent(stats, "orderRequestCount")}
              />
              <MetricCard
                label="Tổng yêu cầu tư vấn"
                value={stats.totalConsultationRequests}
                icon={MessageSquare}
                growthPercent={computeGrowthPercent(stats, "consultationRequestCount")}
              />
              <MetricCard label="Tổng đăng ký affiliate" value={stats.totalAffiliateApplications} icon={Users} />
              <MetricCard label="Yêu cầu đang chờ xử lý" value={stats.pendingOrderRequests} icon={Clock} />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-base font-semibold text-gray-900">Yêu cầu theo tháng</h2>
              <p className="mb-4 text-sm text-gray-500">6 tháng gần nhất</p>
              <MonthlyStatsChart data={stats.monthlyStats} />
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
            Chỉ Admin mới xem được số liệu tổng quan và biểu đồ. Tài khoản Editor vẫn xem được danh sách đơn
            hàng gần đây bên dưới.
          </div>
        )}

        <div>
          <h2 className="mb-4 font-heading text-base font-semibold text-gray-900">Đơn hàng gần đây</h2>
          <RecentOrdersTable orders={recentOrders.items} />
        </div>
      </div>
    </div>
  );
}
