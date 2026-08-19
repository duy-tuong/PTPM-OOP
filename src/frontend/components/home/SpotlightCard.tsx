"use client";

import { useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Viền phát sáng bám theo con trỏ - mirror đúng kỹ thuật onPointerMove đã dùng ở MagneticButton.tsx
// (không cần thư viện). Set 2 CSS custom property --spot-x/--spot-y (px, tương đối trong card) qua
// style inline, dùng bởi class .spotlight-border (globals.css) - chỉ tô màu var(--primary), không
// đổi màu theo brand khác (giữ đúng nguyên tắc 1 accent đã khoá cho site).
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={handlePointerMove} className={cn("spotlight-border", className)}>
      {children}
    </div>
  );
}
