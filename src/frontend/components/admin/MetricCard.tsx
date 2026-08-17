import type { ComponentType } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  // Chỉ truyền khi tính được thật từ dữ liệu (so 2 tháng gần nhất trong monthlyStats) - KHÔNG bịa %
  // cho 2 card không có breakdown theo tháng (Affiliate, Pending).
  growthPercent?: number;
}

export function MetricCard({ label, value, icon: Icon, growthPercent }: MetricCardProps) {
  const hasGrowth = growthPercent !== undefined && Number.isFinite(growthPercent);
  const isPositive = hasGrowth && growthPercent >= 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className="rounded-lg bg-gray-50 p-2">
          <Icon className="size-4 text-gray-400" />
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className="font-heading text-3xl font-semibold text-gray-900 tabular-nums">
          {value.toLocaleString("vi-VN")}
        </span>

        {hasGrowth && (
          <span
            className={
              isPositive
                ? "inline-flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                : "inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
            }
          >
            {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {Math.abs(growthPercent).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}
