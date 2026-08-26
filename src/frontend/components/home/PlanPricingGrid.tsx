"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { AnimatedPrice } from "@/components/shared/AnimatedPrice";
import { Button } from "@/components/ui/button";
import { priceFor } from "@/components/pricing/PlanConfiguratorSlider";
import { cn, formatCurrency } from "@/lib/utils";
import type { ServicePlanListItemDto } from "@/lib/types/catalog";

const ANNUAL_PERIOD_MONTHS = 12;
const MONTHLY_PERIOD_MONTHS = 1;

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

  const selectedPeriod = isAnnual ? ANNUAL_PERIOD_MONTHS : MONTHLY_PERIOD_MONTHS;

  return (
    <div className="flex flex-col items-center gap-8">
      {hasAnnualPricing && (
        <div className="flex items-center gap-3 rounded-full border border-border/50 bg-muted/30 p-1 shadow-sm">
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              "rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300",
              !isAnnual ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Hàng tháng
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              "relative rounded-full px-6 py-2 text-sm font-semibold transition-all duration-300 flex items-center gap-2",
              isAnnual ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Hàng năm
            {maxDiscountPercent > 0 && (
              <span className="absolute -top-3 -right-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                Tiết kiệm đến {maxDiscountPercent}%
              </span>
            )}
          </button>
        </div>
      )}

      <div className={cn(
        "mx-auto grid w-full items-stretch gap-5 lg:gap-6",
        plans.length === 2 && "max-w-3xl md:grid-cols-2",
        plans.length >= 3 && "max-w-6xl grid-cols-1 md:grid-cols-3",
        plans.length === 1 && "max-w-sm"
      )}>
        {plans.map((plan, index) => (
          <ScrollReveal key={plan.id} delay={index * 0.1}>
            <PlanCard plan={plan} highlighted={plan.isFeatured} period={selectedPeriod} />
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
  // priceFor() tự xử lý gói Custom đúng công thức (price.price luôn = 0 với Custom, xem
  // PlanConfiguratorSlider.tsx) - chỉ "Liên hệ" khi thực sự không có dữ liệu giá nào.
  const amount = price || plan.startingPrice != null ? priceFor(plan, period) : null;
  const suffix = price?.periodMonths === ANNUAL_PERIOD_MONTHS ? "/năm" : "/tháng";

  // Customize CTA based on layout index/highlight status (as requested in earlier steps)
  // The user requested: Starter -> Triển khai ngay, Business -> Chọn gói này, Enterprise -> Liên hệ tư vấn
  // Since we rely on dynamic API data, we'll map CTAs safely based on index if there are 3 cards.
  const cta = highlighted ? "Chọn gói này" : (plan.prices?.length === 0 || amount === null) ? "Liên hệ tư vấn" : "Triển khai ngay";

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col rounded-[20px] border p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl",
        highlighted 
          ? "border-blue-500 bg-blue-50/50 shadow-lg dark:bg-blue-900/10" 
          : "border-border bg-card shadow-sm hover:border-blue-500/30"
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold tracking-widest text-white uppercase shadow-sm whitespace-nowrap">
          Phổ biến nhất
        </div>
      )}

      <div className="mb-4">
        <span className="text-[10px] font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-2 block">{plan.categoryName}</span>
        <h3 className="font-heading text-xl font-bold text-foreground">{plan.name}</h3>
        {plan.shortDescription && <p className="mt-2 text-sm text-muted-foreground">{plan.shortDescription}</p>}
      </div>

      <div className="mb-6 flex items-baseline gap-1">
        {amount === null ? (
          <span className="text-4xl font-extrabold tracking-tight">Liên hệ</span>
        ) : (
          <>
            <AnimatedPrice value={amount} className="text-4xl font-extrabold tracking-tight" />
            <span className="text-sm font-medium text-muted-foreground">{suffix}</span>
          </>
        )}
      </div>

      <ul className="mb-6 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature.featureKey} className="flex items-start gap-3 text-sm text-foreground">
            <CheckCircle className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" weight="fill" />
            <span className="font-medium text-muted-foreground">
              {feature.featureLabel}: <span className="text-foreground">{feature.featureValueText}</span>
            </span>
          </li>
        ))}
      </ul>

      <Button
        nativeButton={false}
        variant="default"
        className={cn(
          "w-full h-12 rounded-xl text-base font-semibold shadow-sm transition-all",
          highlighted 
            ? "bg-blue-600 text-white hover:bg-blue-700" 
            : "bg-background text-foreground border-2 border-border hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
        )}
        render={
          <Link href={`/lien-he?planId=${plan.id}`} className="flex items-center justify-center gap-2">
            {cta}
          </Link>
        }
      />
    </div>
  );
}
