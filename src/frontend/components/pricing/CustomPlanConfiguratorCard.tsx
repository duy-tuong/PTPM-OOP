"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedCheck } from "@/components/pricing/AnimatedCheck";
import { CustomPlanSliderConfigurator, type CustomPlanSelection } from "@/components/pricing/CustomPlanSliderConfigurator";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";

const MONTHLY_PERIOD_MONTHS = 1;

function initSelection(plan: ServicePlanListItemDto): CustomPlanSelection | null {
  return plan.minVcpu != null && plan.minRamMb != null && plan.minDiskGb != null
    ? { vcpu: plan.minVcpu, ramMb: plan.minRamMb, diskGb: plan.minDiskGb }
    : null;
}

// Cho phép khách kéo trực tiếp vCPU/RAM/Disk của 1 gói Custom NGAY tại trang danh sách /bang-gia (trước
// đây chỉ kéo được ở trang chi tiết plan qua PlanDetailCustomPricing.tsx) - dùng ở 2 nơi:
// PricingMatrixTabs.tsx (category chỉ có đúng 1 gói Custom, showHeader=true vì không có cột nào khác
// hiện tên/region) và PlanConfiguratorSlider.tsx (panel phải khi gói đang chọn qua slider "chọn gói" là
// Custom, showHeader=false vì cột trái đã hiện tên/region rồi). KHÔNG có dropdown chọn kỳ hạn riêng -
// period nhận từ BillingPeriodToggle cấp trang, tránh 2 nguồn điều khiển kỳ hạn xung đột nhau.
// LƯU Ý: nơi gọi PHẢI truyền `key={plan.id}` - khi người dùng kéo slider "chọn gói" sang 1 Custom plan
// khác, `plan` đổi nhưng component có thể không unmount tự nhiên (cùng vị trí trong JSX); dùng key để
// buộc remount + reset `selection` về cấu hình tối thiểu của plan mới, thay vì setState trong effect
// (tránh cascading render, xem https://react.dev/learn/you-might-not-need-an-effect).
export function CustomPlanConfiguratorCard({
  plan,
  period,
  showHeader = true,
}: {
  plan: ServicePlanListItemDto;
  period: number;
  showHeader?: boolean;
}) {
  const [selection, setSelection] = useState<CustomPlanSelection | null>(() => initSelection(plan));

  const priceRow =
    plan.prices?.find((p) => p.periodMonths === period) ?? plan.prices?.find((p) => p.periodMonths === MONTHLY_PERIOD_MONTHS);

  return (
    <div className="glass-card relative overflow-hidden rounded-2xl p-8">
      {plan.isFeatured && (
        <div className="mb-4 w-fit rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
          Phổ biến nhất
        </div>
      )}

      {showHeader && (
        <div className="mb-4">
          <Link href={`/bang-gia/${plan.slug}`} className="block w-fit text-2xl font-bold text-foreground hover:text-primary">
            {plan.name}
          </Link>
          {plan.regionName && (
            <span className="mt-1 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              📍 {plan.regionName}
            </span>
          )}
        </div>
      )}

      {selection ? (
        <CustomPlanSliderConfigurator
          plan={plan}
          selection={selection}
          onChange={setSelection}
          periodMonths={period}
          discountPercent={priceRow?.discountPercent}
        />
      ) : (
        <p className="text-sm text-destructive">Gói này chưa được cấu hình đầy đủ thông số tuỳ biến.</p>
      )}

      {plan.features.length > 0 && (
        <ul className="my-6 flex flex-col gap-3">
          {plan.features.map((f) => (
            <li key={f.featureKey} className="flex items-center gap-3 text-sm">
              <AnimatedCheck className="size-4 shrink-0 text-primary" />
              {f.featureValueText ? (
                <span className="text-muted-foreground">
                  {f.featureLabel}: <span className="text-foreground">{f.featureValueText}</span>
                </span>
              ) : (
                <span className="text-foreground">{f.featureLabel}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <Button className="w-full" nativeButton={false} render={<Link href={`/lien-he?planId=${plan.id}`}>Triển Khai Ngay</Link>} />
    </div>
  );
}
