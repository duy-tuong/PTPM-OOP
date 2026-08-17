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
    <div className="group relative rounded-[24px] bg-white p-1.5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] ring-1 ring-zinc-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex h-full flex-col justify-between rounded-[18px] bg-zinc-50/50 p-5 ring-1 ring-zinc-950/5 transition-colors group-hover:bg-white">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-white ring-1 ring-zinc-950/5 shadow-sm">
            <Icon className="size-5 text-zinc-700" />
          </div>
          <span className="text-sm font-medium text-zinc-500">{label}</span>
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <span className="font-heading text-4xl font-semibold tracking-tight text-zinc-900 tabular-nums">
            {value.toLocaleString("vi-VN")}
          </span>

          {hasGrowth && (
            <span
              className={
                isPositive
                  ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10"
                  : "inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/10"
              }
            >
              {isPositive ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
              {Math.abs(growthPercent).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
