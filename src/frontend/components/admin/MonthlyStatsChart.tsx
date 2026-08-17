"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlyRequestStatDto } from "@/lib/types/admin";

const chartConfig = {
  orderRequestCount: { label: "Yêu cầu đặt dịch vụ", color: "#00c4d4" },
  consultationRequestCount: { label: "Yêu cầu tư vấn", color: "#6366f1" },
} satisfies ChartConfig;

// Dùng thẳng monthlyStats từ DashboardStatsDto (6 tháng gần nhất, thứ tự cũ->mới, đã zero-fill ở
// backend) - lần dùng recharts đầu tiên thật sự trong dự án (components/ui/chart.tsx scaffold sẵn từ
// trước, chưa từng được dùng).
export function MonthlyStatsChart({ data }: { data: MonthlyRequestStatDto[] }) {
  const chartData = data.map((item) => ({
    ...item,
    monthLabel: item.month.slice(5), // "yyyy-MM" -> "MM"
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart data={chartData} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="monthLabel" tickFormatter={(value: string) => `Th.${value}`} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
        <ChartTooltip content={<ChartTooltipContent labelFormatter={(value) => `Tháng ${value}`} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="orderRequestCount" fill="var(--color-orderRequestCount)" radius={4} />
        <Bar dataKey="consultationRequestCount" fill="var(--color-consultationRequestCount)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
