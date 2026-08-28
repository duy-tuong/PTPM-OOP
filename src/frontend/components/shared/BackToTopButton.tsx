"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

const SHOW_THRESHOLD = 400;

// Nút "về đầu trang" nổi góc dưới-phải - hiện khi cuộn qua khỏi ~1 màn hình, ẩn lại khi ở gần đầu trang.
// Mirror pattern scroll listener đã có ở ReadingProgressBar.tsx (window scroll, passive, 1 listener nhẹ,
// không throttle riêng). Tôn trọng prefers-reduced-motion khi cuộn (behavior "auto" thay vì "smooth").
export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setVisible(window.scrollY > SHOW_THRESHOLD);
    }
    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Về đầu trang"
      className={cn(
        "fixed right-5 bottom-5 z-40 flex size-11 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:right-8 sm:bottom-8",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <ArrowUp className="size-5" weight="bold" />
    </button>
  );
}
