"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedCheck } from "@/components/pricing/AnimatedCheck";
import { AnimatedPrice } from "@/components/shared/AnimatedPrice";
import { computeCustomPlanUnitPrice } from "@/lib/pricing/customPlanPricing";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";

const MONTHLY_PERIOD_MONTHS = 1;

// Fixed: price.price/promotionalPrice như cũ. Custom: price.price luôn = 0 (bị bỏ qua với gói Custom,
// xem PlanPrice.DiscountPercent ở backend) - phải tính theo cấu hình TỐI THIỂU (Min vCPU/RAM/Disk),
// dùng ĐÚNG công thức với lúc hiển thị "giá từ" trên trang chi tiết (ServicePlanService.ComputeStartingPrice)
// để tránh hiện "0đ" (bug đã gặp) hoặc hiển thị 1 giá nhưng lúc mua tính ra giá khác.
export function priceFor(plan: ServicePlanListItemDto, period: number): number {
  const price = plan.prices?.find((p) => p.periodMonths === period) ?? plan.prices?.find((p) => p.periodMonths === MONTHLY_PERIOD_MONTHS);

  if (plan.packageType === "Custom") {
    if (plan.minVcpu == null || plan.minRamMb == null || plan.minDiskGb == null) return plan.startingPrice ?? 0;
    return computeCustomPlanUnitPrice(plan, plan.minVcpu, plan.minRamMb, plan.minDiskGb, price?.periodMonths ?? MONTHLY_PERIOD_MONTHS, price?.discountPercent);
  }

  return price ? (price.promotionalPrice ?? price.price) : (plan.startingPrice ?? 0);
}

// "Máy Tính Cấu Hình" kiểu DigitalOcean/Vultr - thay PricingMatrixTable (đã xoá). Slider snap vào đúng
// các gói CÓ THẬT (không nội suy công thức giá liên tục - dữ liệu thật là gói cố định rời rạc, nội suy
// sẽ hiện số không đặt mua được, vi phạm nguyên tắc không bịa dữ liệu). Trục sắp xếp = giá tăng dần
// (luôn có sẵn, có ý nghĩa cho MỌI danh mục bất kể tập feature khác nhau thế nào).
export function PlanConfiguratorSlider({ plans, period }: { plans: ServicePlanListItemDto[]; period: number }) {
  const sorted = useMemo(() => [...plans].sort((a, b) => (a.startingPrice ?? 0) - (b.startingPrice ?? 0)), [plans]);
  const defaultIndex = Math.max(0, sorted.findIndex((p) => p.isFeatured));
  const [index, setIndex] = useState(defaultIndex);
  const plan = sorted[index];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Bạn cần bao nhiêu tài nguyên?</p>
          <Link href={`/bang-gia/${plan.slug}`} className="mt-1 block w-fit text-2xl font-bold text-foreground hover:text-primary">
            {plan.name}
          </Link>
          {plan.regionName && (
            <span className="mt-1 inline-block rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              📍 {plan.regionName}
            </span>
          )}
        </div>
        <input
          type="range"
          min={0}
          max={sorted.length - 1}
          step={1}
          value={index}
          onChange={(e) => setIndex(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-input accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{sorted[0].name}</span>
          <span>{sorted[sorted.length - 1].name}</span>
        </div>
      </div>

      <div className="glass-card relative overflow-hidden rounded-2xl p-8">
        {plan.isFeatured && (
          <div className="mb-4 w-fit rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
            Phổ biến nhất
          </div>
        )}
        <p className="text-sm text-muted-foreground">Hoá đơn ước tính</p>
        <div className="my-2 text-4xl font-bold">
          <AnimatedPrice value={priceFor(plan, period)} />
        </div>
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
        <Button
          className="w-full"
          nativeButton={false}
          render={<Link href={`/lien-he?planId=${plan.id}`}>Triển Khai Ngay</Link>}
        />
      </div>
    </div>
  );
}
