"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BillingPeriodToggle } from "@/components/shared/BillingPeriodToggle";
import { AnimatedCheck } from "@/components/pricing/AnimatedCheck";
import { AnimatedPrice } from "@/components/shared/AnimatedPrice";
import { PlanConfiguratorSlider, priceFor } from "@/components/pricing/PlanConfiguratorSlider";
import { CustomPlanConfiguratorCard } from "@/components/pricing/CustomPlanConfiguratorCard";
import { PlanComparisonTable } from "@/components/pricing/PlanComparisonTable";
import { DomainPricingTable } from "@/components/pricing/DomainPricingTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryIcon } from "@/lib/constants/serviceCategoryIcons";
import { countryFlag } from "@/lib/utils/region";
import { cn } from "@/lib/utils";
import type { ServiceCategoryDto, ServicePlanListItemDto, TldPricingDto, RegionDto } from "@/lib/types/catalog";

const ANNUAL_PERIOD_MONTHS = 12;
const MONTHLY_PERIOD_MONTHS = 1;
const DOMAIN_SLUG = "domain";

// Điều phối tab danh mục (pill) + toggle tháng/năm toàn trang, chuyển giữa PlanConfiguratorSlider (danh
// mục kỹ thuật có >=2 gói - "Máy Tính Cấu Hình" kiểu DigitalOcean/Vultr, thay PricingMatrixTable cũ đã
// xoá), SinglePlanCard (đúng 1 gói - kéo slider 1 điểm không có ý nghĩa) và DomainPricingTable (riêng
// Domain). Fetch 1 lần toàn bộ plans/TLD ở page.tsx (Server Component) - lọc/nhóm hoàn toàn phía client
// ở đây, đổi tab không cần network round-trip (dự án quy mô nhỏ, dữ liệu ít).
export function PricingMatrixTabs({
  categories,
  plans,
  tldPricing,
  regions,
}: {
  categories: ServiceCategoryDto[];
  plans: ServicePlanListItemDto[];
  tldPricing: TldPricingDto[];
  regions: RegionDto[];
}) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "");
  const [isAnnual, setIsAnnual] = useState(false);
  const [regionFilter, setRegionFilter] = useState<string | null>(null);

  const plansByCategory = useMemo(() => {
    const map = new Map<string, ServicePlanListItemDto[]>();
    plans.forEach((plan) => {
      const list = map.get(plan.categorySlug) ?? [];
      list.push(plan);
      map.set(plan.categorySlug, list);
    });
    return map;
  }, [plans]);

  const categoryPlans = useMemo(() => plansByCategory.get(activeSlug) ?? [], [plansByCategory, activeSlug]);
  // Lọc theo Region CHỈ trong phạm vi danh mục đang chọn - Region là trang trí (xem Region.cs), lọc
  // cục bộ phía client (toàn bộ plans đã fetch 1 lần, không cần round-trip mạng lại khi đổi filter).
  const activePlans = useMemo(
    () => (regionFilter ? categoryPlans.filter((plan) => plan.regionName === regionFilter) : categoryPlans),
    [categoryPlans, regionFilter],
  );
  const period = isAnnual ? ANNUAL_PERIOD_MONTHS : MONTHLY_PERIOD_MONTHS;
  const regionsInCategory = useMemo(
    () => regions.filter((region) => categoryPlans.some((plan) => plan.regionName === region.name)),
    [regions, categoryPlans],
  );

  const hasAnnualPricing = activePlans.some((plan) => plan.prices?.some((p) => p.periodMonths === ANNUAL_PERIOD_MONTHS));
  const maxDiscountPercent = useMemo(() => {
    if (!hasAnnualPricing) return 0;
    const percents = activePlans
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
  }, [activePlans, hasAnnualPricing]);

  return (
    <div className="flex flex-col gap-8">
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.slug);
          const isActive = activeSlug === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => {
                setActiveSlug(category.slug);
                setRegionFilter(null);
              }}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:scale-[1.03] hover:text-foreground",
              )}
            >
              <Icon className="size-4" weight={isActive ? "fill" : "regular"} />
              {category.name}
            </button>
          );
        })}
      </nav>

      {activeSlug !== DOMAIN_SLUG && (hasAnnualPricing || regionsInCategory.length > 0) && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {hasAnnualPricing && (
            <BillingPeriodToggle
              isAnnual={isAnnual}
              onToggle={() => setIsAnnual((prev) => !prev)}
              discountPercent={maxDiscountPercent}
            />
          )}
          {regionsInCategory.length > 0 && (
            <Select
              items={[
                { value: "all-regions", label: "Mọi khu vực" },
                ...regionsInCategory.map((region) => ({
                  value: region.name,
                  label: `${countryFlag(region.countryCode)} ${region.name} (${region.city})`,
                })),
              ]}
              value={regionFilter ?? "all-regions"}
              onValueChange={(value) => setRegionFilter(!value || value === "all-regions" ? null : value)}
            >
              <SelectTrigger className="w-[220px] rounded-full">
                <SelectValue placeholder="Mọi khu vực" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectItem value="all-regions">Mọi khu vực</SelectItem>
                {regionsInCategory.map((region) => (
                  <SelectItem key={region.id} value={region.name}>
                    {countryFlag(region.countryCode)} {region.name} ({region.city})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {activeSlug === DOMAIN_SLUG ? (
        <DomainPricingTable tldPricing={tldPricing} />
      ) : activePlans.length >= 2 ? (
        <div key={activeSlug} className="flex flex-col gap-8">
          <PlanConfiguratorSlider plans={activePlans} period={period} />
          <PlanComparisonTable plans={activePlans} period={period} />
        </div>
      ) : activePlans.length === 1 ? (
        activePlans[0].packageType === "Custom" ? (
          <div className="mx-auto max-w-md">
            <CustomPlanConfiguratorCard key={activePlans[0].id} plan={activePlans[0]} period={period} />
          </div>
        ) : (
          <SinglePlanCard plan={activePlans[0]} period={period} />
        )
      ) : regionFilter ? (
        <p className="py-12 text-center text-muted-foreground">Không có gói dịch vụ nào ở khu vực này.</p>
      ) : (
        <p className="py-12 text-center text-muted-foreground">Chưa có gói dịch vụ nào cho danh mục này.</p>
      )}
    </div>
  );
}

// Đúng 1 gói trong danh mục - hiện thẳng "hoá đơn" như PlanConfiguratorSlider nhưng không có slider
// (kéo slider 1 điểm không có ý nghĩa).
function SinglePlanCard({ plan, period }: { plan: ServicePlanListItemDto; period: number }) {
  return (
    <div className="glass-card relative mx-auto max-w-md overflow-hidden rounded-2xl p-8">
      {plan.isFeatured && (
        <div className="mb-4 w-fit rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
          Phổ biến nhất
        </div>
      )}
      <Link href={`/bang-gia/${plan.slug}`} className="w-fit text-sm text-muted-foreground hover:text-primary">
        {plan.name}
      </Link>
      {plan.regionName && (
        <span className="mt-1 inline-block w-fit rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          📍 {plan.regionName}
        </span>
      )}
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
  );
}
