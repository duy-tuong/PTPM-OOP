"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react";
import { ScrollReveal } from "@/components/home/ScrollReveal";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";

const MOCK_PLANS = [
  {
    id: "starter",
    name: "VPS SSD Starter",
    priceMonthly: 99000,
    priceAnnual: 82170, // 17% off
    isPopular: false,
    cta: "Triển khai ngay",
    href: "/lien-he?plan=starter",
    features: [
      "1 vCPU Core",
      "1GB RAM",
      "20GB SSD Storage",
      "100Mbps Network",
      "1 IPv4 Address",
      "Basic Support 24/7"
    ]
  },
  {
    id: "business",
    name: "VPS SSD Business",
    priceMonthly: 299000,
    priceAnnual: 248170, // 17% off
    isPopular: true,
    cta: "Chọn gói này",
    href: "/lien-he?plan=business",
    features: [
      "2 vCPU Cores",
      "4GB RAM",
      "60GB SSD Storage",
      "1Gbps Network",
      "1 IPv4 + IPv6 Address",
      "Priority Support 24/7",
      "Free Daily Backup"
    ]
  },
  {
    id: "enterprise",
    name: "VPS SSD Enterprise",
    priceMonthly: null,
    priceAnnual: null,
    isPopular: false,
    cta: "Liên hệ tư vấn",
    href: "/lien-he?plan=enterprise",
    features: [
      "Tùy chỉnh vCPU Cores",
      "Tùy chỉnh RAM",
      "Unlimited SSD Storage",
      "10Gbps Network",
      "Multiple IP Addresses",
      "Dedicated Account Manager",
      "Custom SLA 99.99%"
    ]
  }
];

export function PlanPricingGrid() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="flex flex-col items-center gap-10">
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
          <span className="absolute -top-3 -right-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            Tiết kiệm đến 17%
          </span>
        </button>
      </div>

      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-8">
        {MOCK_PLANS.map((plan, index) => (
          <ScrollReveal key={plan.id} delay={index * 0.1}>
            <div
              className={cn(
                "group relative flex h-full flex-col rounded-[24px] border p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl",
                plan.isPopular 
                  ? "border-blue-500 bg-blue-50/50 shadow-lg dark:bg-blue-900/10" 
                  : "border-border bg-card shadow-sm hover:border-blue-500/30"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold tracking-widest text-white uppercase shadow-sm">
                  Phổ biến nhất
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-heading text-xl font-bold text-foreground">{plan.name}</h3>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                {plan.priceMonthly === null ? (
                  <span className="text-4xl font-extrabold tracking-tight">Liên hệ</span>
                ) : (
                  <>
                    <span className="text-4xl font-extrabold tracking-tight">
                      {formatCurrency(isAnnual ? plan.priceAnnual! : plan.priceMonthly)}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">/tháng</span>
                  </>
                )}
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" weight="fill" />
                    <span className="font-medium text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                nativeButton={false}
                variant="default"
                className={cn(
                  "w-full h-12 rounded-xl text-base font-semibold shadow-sm transition-all",
                  plan.isPopular 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "bg-background text-foreground border-2 border-border hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                )}
                render={
                  <Link href={plan.href} className="flex items-center justify-center gap-2">
                    {plan.cta}
                  </Link>
                }
              />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
