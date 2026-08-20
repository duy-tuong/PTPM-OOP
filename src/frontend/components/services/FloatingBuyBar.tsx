"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import type { ServiceCategoryDto } from "@/lib/types/catalog";

// Section tùy chọn - "chốt sale" lần cuối khi khách đã lướt qua khỏi bảng giá (id="pricing" đặt sẵn ở
// page.tsx) mà chưa bấm mua. Tái dùng đúng kỹ thuật IntersectionObserver đã dùng cho scroll-spy ở
// ServicesCommandCenter.tsx - ở đây chỉ cần biết "đã cuộn qua khỏi section giá chưa" (không phải đang
// active section nào), nên chỉ theo dõi đúng 1 target thay vì nhiều section.
export function FloatingBuyBar({
  category,
  cheapestPrice,
}: {
  category: ServiceCategoryDto;
  cheapestPrice: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("pricing");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!Number.isFinite(cheapestPrice)) {
    return null;
  }

  function scrollToPricing() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById("pricing")
      ?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-foreground">
          Bắt đầu triển khai {category.name} chỉ từ{" "}
          <span className="text-primary">{formatCurrency(cheapestPrice)}/tháng</span>
        </p>
        <Button onClick={scrollToPricing} className="gap-2">
          Xem bảng giá
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
}
