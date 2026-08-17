"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
      <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 20 }}>
        <defs>
          <linearGradient id="fillOrder" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-orderRequestCount)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-orderRequestCount)" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="fillConsultation" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-consultationRequestCount)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-consultationRequestCount)" stopOpacity={0.0} />
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
          allowDecimals={false} 
          tickLine={false} 
          axisLine={false} 
          width={32} 
          tick={{ fill: "#71717a", fontSize: 12 }} 
        />
        <ChartTooltip 
          cursor={{ stroke: '#a1a1aa', strokeWidth: 1, strokeDasharray: '4 4' }}
          content={<ChartTooltipContent labelFormatter={(value) => `Tháng ${value}`} />} 
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area 
          type="monotone" 
          dataKey="orderRequestCount" 
          stroke="var(--color-orderRequestCount)" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#fillOrder)" 
        />
        <Area 
          type="monotone" 
          dataKey="consultationRequestCount" 
          stroke="var(--color-consultationRequestCount)" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#fillConsultation)" 
        />
      </AreaChart>
    </ChartContainer>
  );
}
