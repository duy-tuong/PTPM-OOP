"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

// Toggle Hàng tháng/Hàng năm dùng chung (tách từ PlanPricingGrid.tsx - PricingMatrixTabs.tsx ở
// /bang-gia cũng dùng lại nguyên component này). Cục gạt dùng motion.span animate x theo spring (thay
// vì class translate-x-7 tĩnh cũ) - "animate x" trực tiếp trên 1 phần tử, không cần layoutId (kỹ thuật
// đó dành cho animation giữa 2 DOM node tách biệt). Badge % tiết kiệm pop-in qua AnimatePresence, màu
// bg-foreground/text-background (đúng token "trắng-đen tự đảo theo theme" đã dùng cho CTA Navbar).
export function BillingPeriodToggle({
  isAnnual,
  onToggle,
  discountPercent,
}: {
  isAnnual: boolean;
  onToggle: () => void;
  discountPercent?: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>
        Hàng tháng
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isAnnual}
        aria-label="Chuyển đổi kỳ hạn thanh toán"
        onClick={onToggle}
        data-state={isAnnual ? "checked" : "unchecked"}
        className="relative h-7 w-14 shrink-0 rounded-full bg-input transition-colors data-[state=checked]:bg-primary"
      >
        <motion.span
          className="absolute top-1 left-1 size-5 rounded-full bg-background shadow"
          animate={{ x: isAnnual ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>
        Hàng năm
      </span>
      <AnimatePresence>
        {discountPercent != null && discountPercent > 0 && (
          <motion.span
            key={isAnnual ? "annual" : "monthly"}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="rounded-full bg-foreground px-2.5 py-1 text-xs font-semibold text-background"
          >
            Tiết kiệm tới {discountPercent}%
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
