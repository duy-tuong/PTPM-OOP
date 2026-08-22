"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import type { ServicePlanDetailDto } from "@/lib/types/catalog";

// Mirror FloatingBuyBar.tsx (components/services/) - cùng kỹ thuật IntersectionObserver theo dõi
// #pricing (đặt ở PlanDetailContent.tsx). Khác bản gốc: CTA là Link thẳng /lien-he?planId= thay vì nút
// cuộn lại - trang chi tiết 1 gói ngắn, mục tiêu là đẩy thẳng tới bước đặt dịch vụ, không cần cuộn lại.
export function PlanFloatingBuyBar({ plan, price }: { plan: ServicePlanDetailDto; price: number | null }) {
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

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm transition-transform duration-300",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-foreground">
          {plan.name}
          {price != null && (
            <>
              {" "}
              chỉ từ <span className="text-primary">{formatCurrency(price)}</span>
            </>
          )}
        </p>
        <Button
          nativeButton={false}
          className="gap-2"
          render={
            <Link href={`/lien-he?planId=${plan.id}`}>
              Đặt dịch vụ
              <ArrowRight className="size-4" />
            </Link>
          }
        />
      </div>
    </div>
  );
}
