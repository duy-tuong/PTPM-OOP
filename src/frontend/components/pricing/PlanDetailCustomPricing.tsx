"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomPlanSliderConfigurator, type CustomPlanSelection } from "@/components/pricing/CustomPlanSliderConfigurator";
import type { ServicePlanDetailDto } from "@/lib/types/catalog";

// Khối "Bảng Giá" của trang chi tiết gói Custom - thay danh sách giá cố định (PlanDetailContent.tsx
// dùng cho gói Fixed) bằng thanh trượt preview. Chỉ để khách hình dung giá trước - cấu hình thật + giá
// thật do OrderRequestForm.tsx (trang /lien-he) xử lý, backend luôn tính lại (xem
// CustomPlanSliderConfigurator.tsx).
export function PlanDetailCustomPricing({ plan }: { plan: ServicePlanDetailDto }) {
  const defaultPeriod = plan.prices.find((p) => p.isDefault) ?? plan.prices[0] ?? null;
  const [periodMonths, setPeriodMonths] = useState<number | null>(defaultPeriod?.periodMonths ?? null);
  const [selection, setSelection] = useState<CustomPlanSelection | null>(
    plan.minVcpu != null && plan.minRamMb != null && plan.minDiskGb != null
      ? { vcpu: plan.minVcpu, ramMb: plan.minRamMb, diskGb: plan.minDiskGb }
      : null,
  );

  if (!selection) {
    return <p className="text-sm text-muted-foreground">Gói này chưa được cấu hình đầy đủ thông số tuỳ biến.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {plan.prices.length > 0 && (
        <Select
          items={plan.prices.map((price) => ({
            value: String(price.periodMonths),
            label: `${price.periodMonths} tháng${price.discountPercent ? ` - giảm ${price.discountPercent}%` : ""}`,
          }))}
          value={periodMonths ? String(periodMonths) : null}
          onValueChange={(value) => setPeriodMonths(value ? Number(value) : null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn chu kỳ" />
          </SelectTrigger>
          <SelectContent>
            {plan.prices.map((price) => (
              <SelectItem key={price.periodMonths} value={String(price.periodMonths)}>
                {price.periodMonths} tháng{price.discountPercent ? ` - giảm ${price.discountPercent}%` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <CustomPlanSliderConfigurator
        plan={plan}
        selection={selection}
        onChange={setSelection}
        periodMonths={periodMonths ?? 1}
        discountPercent={plan.prices.find((p) => p.periodMonths === periodMonths)?.discountPercent}
      />

      <Button
        className="w-full"
        nativeButton={false}
        render={<Link href={`/lien-he?planId=${plan.id}`}>Đặt dịch vụ</Link>}
      />
    </div>
  );
}
