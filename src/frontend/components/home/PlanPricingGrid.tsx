"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { SpotlightCard } from "@/components/home/SpotlightCard";
import { BillingPeriodToggle } from "@/components/shared/BillingPeriodToggle";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";

const ANNUAL_PERIOD_MONTHS = 12;
const MONTHLY_PERIOD_MONTHS = 1;

// Toggle Hàng tháng/Hàng năm chuyển đổi period thật lấy từ plan.prices (PeriodMonths=1 và 12, seed ở
// Phase 3.0) - không tự tính giá năm bằng công thức bịa (kiểu "-20%" cố định trong bản Stitch gốc).
// % tiết kiệm hiển thị cạnh toggle (nếu có) tính thật từ chênh lệch giá thật giữa 2 kỳ hạn, lấy mức cao
// nhất trong các gói có đủ dữ liệu 2 kỳ hạn - không hiện nếu không có gói nào có giá năm.
export function PlanPricingGrid({ plans }: { plans: ServicePlanListItemDto[] }) {
  const hasAnnualPricing = plans?.some((plan) => plan.prices?.some((p) => p.periodMonths === ANNUAL_PERIOD_MONTHS));
  const [isAnnual, setIsAnnual] = useState(false);

  const maxDiscountPercent = useMemo(() => {
    if (!hasAnnualPricing) return 0;
    const percents = plans
      .map((plan) => {
        const monthly = plan.prices?.find((p) => p.periodMonths === MONTHLY_PERIOD_MONTHS);
        const annual = plan.prices?.find((p) => p.periodMonths === ANNUAL_PERIOD_MONTHS);
        if (!monthly || !annual) return null;
        const monthlyTotal = (monthly.promotionalPrice ?? monthly.price) * 12;
        const annualTotal = annual.promotionalPrice ?? annual.price;
        if (monthlyTotal <= 0) return null;
        return Math.round((1 - annualTotal / monthlyTotal) * 100);
      })
      .filter((value): value is number => value !== null && value > 0);
    return percents.length > 0 ? Math.max(...percents) : 0;
  }, [plans, hasAnnualPricing]);

  const highlightIndex = plans.length >= 3 ? 1 : -1;
  const selectedPeriod = isAnnual ? ANNUAL_PERIOD_MONTHS : MONTHLY_PERIOD_MONTHS;

  return (
    <div className="flex flex-col items-center gap-8">
      {hasAnnualPricing && (
        <BillingPeriodToggle
          isAnnual={isAnnual}
          onToggle={() => setIsAnnual((prev) => !prev)}
          discountPercent={maxDiscountPercent}
        />
      )}

      <div
        className={cn(
          "mx-auto grid w-full grid-cols-1 items-start gap-8",
          plans.length === 2 && "max-w-3xl md:grid-cols-2",
          plans.length >= 3 && "md:grid-cols-3",
        )}
      >
        {plans.map((plan, index) => (
          <ScrollReveal key={plan.id} delay={index * 0.15}>
            <PlanCard plan={plan} highlighted={index === highlightIndex} period={selectedPeriod} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  highlighted,
  period,
}: {
  plan: ServicePlanListItemDto;
  highlighted: boolean;
  period: number;
}) {
  const price = plan.prices?.find((p) => p.periodMonths === period) ?? plan.prices?.find((p) => p.periodMonths === MONTHLY_PERIOD_MONTHS);
  const amount = price ? (price.promotionalPrice ?? price.price) : plan.startingPrice;
  const suffix = price?.periodMonths === ANNUAL_PERIOD_MONTHS ? "/năm" : "/tháng";

  return (
    <SpotlightCard
      className={cn(
        "glass-card relative flex h-full flex-col rounded-xl transition-all duration-500",
        "hover:-translate-y-2 hover:shadow-[0_20px_80px_-20px_color-mix(in_oklch,var(--primary)_30%,transparent)]",
        highlighted
          ? "z-10 border-primary/40 shadow-[0_0_50px_color-mix(in_oklch,var(--primary)_20%,transparent)] md:-translate-y-4 hover:md:-translate-y-6"
          : "opacity-90 hover:opacity-100",
      )}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl p-8">
        {highlighted && (
          <>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold tracking-widest text-primary-foreground uppercase shadow-[0_0_15px_color-mix(in_oklch,var(--primary)_40%,transparent)]">
              Phổ biến nhất
            </div>
            {/* Dải glow mờ hắt từ dưới lên - chỉ gói giữa, chỉ dùng var(--primary) (không đổi màu
                theo brand khác, giữ đúng nguyên tắc 1 accent đã khoá). */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 -bottom-12 h-32 opacity-70 blur-2xl"
              style={{
                background:
                  "radial-gradient(ellipse at center, color-mix(in oklch, var(--primary) 40%, transparent), transparent 70%)",
              }}
            />
          </>
        )}

        <div className="mb-6">
          <span className="text-xs font-medium tracking-widest text-primary uppercase">{plan.categoryName}</span>
          <h3 className="font-heading mt-1 text-xl">{plan.name}</h3>
          {plan.shortDescription && <p className="mt-1 text-sm text-muted-foreground">{plan.shortDescription}</p>}
        </div>

        {amount != null && (
          <div className="mb-8 flex items-baseline gap-1">
            <span className="text-5xl font-bold tracking-tight">{formatCurrency(amount)}</span>
            <span className="text-sm text-muted-foreground">{suffix}</span>
          </div>
        )}

        {plan.features.length > 0 && (
          <ul className="mb-8 flex flex-1 flex-col gap-3">
            {plan.features.map((feature) => (
              <li key={feature.featureKey} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" weight="fill" />
                <span>
                  {feature.featureLabel}: <span className="text-foreground">{feature.featureValueText}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <Button
          nativeButton={false}
          variant={highlighted ? "default" : "outline"}
          className={cn("w-full", highlighted ? "btn-shine" : "border-primary text-primary hover:bg-primary/10")}
          render={
            <Link href={`/lien-he?planId=${plan.id}`} className="flex items-center justify-center gap-2">
              Triển Khai Ngay
              <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" />
            </Link>
          }
        />
      </div>
    </SpotlightCard>
  );
}
