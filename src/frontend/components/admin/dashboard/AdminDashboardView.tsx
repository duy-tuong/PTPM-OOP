import { ShoppingCart, MessageSquare, Users, Clock } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import { MonthlyStatsChart } from "@/components/admin/MonthlyStatsChart";
import { RecentOrdersTable } from "@/components/admin/RecentOrdersTable";
import type { PagedResult } from "@/lib/types/common";
import type { AdminOrderRequestDto, DashboardStatsDto } from "@/lib/types/admin";

interface AdminDashboardViewProps {
  stats: DashboardStatsDto;
  recentOrders: PagedResult<AdminOrderRequestDto>;
}

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

export function AdminDashboardView({ stats, recentOrders }: AdminDashboardViewProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Tổng yêu cầu đặt dịch vụ"
          value={stats.totalOrderRequests}
          icon={ShoppingCart}
          growthPercent={computeGrowthPercent(stats, "orderRequestCount")}
          accentColor="blue"
        />
        <MetricCard
          label="Tổng yêu cầu tư vấn"
          value={stats.totalConsultationRequests}
          icon={MessageSquare}
          growthPercent={computeGrowthPercent(stats, "consultationRequestCount")}
          accentColor="violet"
        />
        <MetricCard
          label="Tổng đăng ký affiliate"
          value={stats.totalAffiliateApplications}
          icon={Users}
          accentColor="amber"
        />
        <MetricCard
          label="Yêu cầu đang chờ xử lý"
          value={stats.pendingOrderRequests}
          icon={Clock}
          accentColor="rose"
        />
      </div>

      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <div className="mb-8">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Yêu cầu theo tháng</h2>
          <p className="mt-1 text-sm text-zinc-500">Thống kê 6 tháng gần nhất</p>
        </div>
        <MonthlyStatsChart data={stats.monthlyStats} />
      </div>

      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold text-zinc-900">Đơn hàng gần đây</h2>
        <RecentOrdersTable orders={recentOrders.items} />
      </div>
    </>
  );
}
