import { TrendingUp, Wallet, Users, UserMinus, Repeat, Gem } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import { MrrTrendChart } from "@/components/admin/revenue/MrrTrendChart";
import { formatCurrency } from "@/lib/utils";
import type {
  RevenueAnalyticsSummaryDto,
  MrrTrendPointDto,
  RevenueByProductLineDto,
  RevenueByRegionDto,
  ArAgingBucketDto,
} from "@/lib/types/admin";

interface RevenueAnalyticsViewProps {
  summary: RevenueAnalyticsSummaryDto;
  trend: MrrTrendPointDto[];
  byProductLine: RevenueByProductLineDto[];
  byRegion: RevenueByRegionDto[];
  arAging: ArAgingBucketDto[];
}

// Trang "Doanh thu" (Phần 7, Đợt 2 - Kinh doanh) - toàn bộ số liệu tính từ dữ liệu OrderRequest đã có,
// xem RevenueAnalyticsService cho công thức + các đơn giản hoá đã ghi rõ (Net New MRR không tách
// Expansion/Contraction, AR Aging diễn giải lại cho hệ thống trả trước).
export function RevenueAnalyticsView({ summary, trend, byProductLine, byRegion, arAging }: RevenueAnalyticsViewProps) {
  const totalArAging = arAging.reduce((sum, b) => sum + b.amount, 0);
  const maxProductRevenue = Math.max(1, ...byProductLine.map((r) => r.revenue));
  const maxRegionRevenue = Math.max(1, ...byRegion.map((r) => r.revenue));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="MRR (Doanh thu định kỳ/tháng)" value={summary.mrr} icon={Wallet} accentColor="blue" format="currency" />
        <MetricCard label="ARR (Doanh thu định kỳ/năm)" value={summary.arr} icon={TrendingUp} accentColor="violet" format="currency" />
        <MetricCard label="Net New MRR (tháng này)" value={summary.netNewMrr} icon={Repeat} accentColor="amber" format="currency" />
        <MetricCard label="ARPU (Doanh thu/khách hàng)" value={summary.arpu} icon={Users} accentColor="blue" format="currency" />
        <MetricCard label="Churn Rate (tháng này)" value={summary.churnRatePercent} icon={UserMinus} accentColor="rose" format="percent" />
        <MetricCard label="LTV (Giá trị vòng đời khách hàng)" value={summary.ltv} icon={Gem} accentColor="violet" format="currency" />
      </div>

      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <div className="mb-8">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Xu hướng MRR mới ký</h2>
          <p className="mt-1 text-sm text-zinc-500">12 tháng gần nhất - tổng MRR quy đổi từ các đơn mua mới hoàn tất trong tháng</p>
        </div>
        <MrrTrendChart data={trend} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Doanh thu theo dòng sản phẩm</h2>
          <div className="mt-6 flex flex-col gap-4">
            {byProductLine.length === 0 && <p className="text-sm text-zinc-500">Chưa có doanh thu nào.</p>}
            {byProductLine.map((row) => (
              <div key={row.productLine} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700">{row.productLine}</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">{formatCurrency(row.revenue)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(row.revenue / maxProductRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Doanh thu theo Region</h2>
          <div className="mt-6 flex flex-col gap-4">
            {byRegion.length === 0 && <p className="text-sm text-zinc-500">Chưa có doanh thu nào.</p>}
            {byRegion.map((row) => (
              <div key={row.regionName} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-700">{row.regionName}</span>
                  <span className="font-semibold text-zinc-900 tabular-nums">{formatCurrency(row.revenue)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${(row.revenue / maxRegionRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-zinc-200/60 bg-white p-8 shadow-sm ring-1 ring-zinc-950/5">
        <div className="mb-2">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Tuổi nợ đơn hàng chưa thanh toán</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Hệ thống trả trước 100% qua PayOS - đây là doanh thu đang treo chờ thanh toán, không phải công nợ trả sau thật.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {arAging.map((bucket) => (
            <div key={bucket.bucketLabel} className="rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-4">
              <p className="text-xs font-medium text-zinc-500">{bucket.bucketLabel}</p>
              <p className="mt-2 font-heading text-xl font-semibold text-zinc-900 tabular-nums">{formatCurrency(bucket.amount)}</p>
              <p className="mt-1 text-xs text-zinc-400">{bucket.orderCount} đơn</p>
            </div>
          ))}
        </div>
        {totalArAging > 0 && (
          <p className="mt-4 text-sm text-zinc-500">
            Tổng: <span className="font-semibold text-zinc-900">{formatCurrency(totalArAging)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
