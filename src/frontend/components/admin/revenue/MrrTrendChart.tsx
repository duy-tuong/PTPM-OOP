"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import type { MrrTrendPointDto } from "@/lib/types/admin";

const chartConfig = {
  newMrrBookings: { label: "MRR mới ký (bookings)", color: "#00c4d4" },
} satisfies ChartConfig;

// Mirror MonthlyStatsChart.tsx - "New MRR bookings" theo tháng (đơn giản hoá, xem
// MrrTrendPointDto/RevenueAnalyticsService.GetTrendAsync - KHÔNG phải MRR đang sống dựng lại lịch sử).
export function MrrTrendChart({ data }: { data: MrrTrendPointDto[] }) {
  const chartData = data.map((item) => ({ ...item, monthLabel: item.month.slice(5) }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 20 }}>
        <defs>
          <linearGradient id="fillNewMrr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-newMrrBookings)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-newMrrBookings)" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
        <XAxis
          dataKey="monthLabel"
          tickFormatter={(value: string) => `Th.${value}`}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickMargin={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={64}
          tick={{ fill: "#71717a", fontSize: 12 }}
          tickFormatter={(value: number) => (value >= 1000000 ? `${(value / 1000000).toFixed(0)}tr` : String(value))}
        />
        <ChartTooltip
          cursor={{ stroke: "#a1a1aa", strokeWidth: 1, strokeDasharray: "4 4" }}
          content={<ChartTooltipContent labelFormatter={(value) => `Tháng ${value}`} formatter={(value) => formatCurrency(Number(value))} />}
        />
        <Area
          type="monotone"
          dataKey="newMrrBookings"
          stroke="var(--color-newMrrBookings)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#fillNewMrr)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
