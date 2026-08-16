"use client";

import { useRef } from "react";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Spotlight cyan theo vị trí chuột, giới hạn trong section bao ngoài (port từ .mouse-glow của bản
// Stitch Claudverse, dùng cho Final CTA). Tự tắt khi prefers-reduced-motion.
export function MouseGlow({ children, className }: { children: ReactNode; className?: string }) {
  const glowRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const glow = glowRef.current;
    const container = e.currentTarget;
    if (!glow) return;
    const rect = container.getBoundingClientRect();
    glow.style.left = `${e.clientX - rect.left}px`;
    glow.style.top = `${e.clientY - rect.top}px`;
  }

  return (
    <div onPointerMove={handlePointerMove} className={cn("group", className)}>
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute z-0 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 70%)",
        }}
      />
      {children}
    </div>
  );
}
