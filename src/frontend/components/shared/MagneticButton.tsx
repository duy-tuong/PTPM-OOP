"use client";

import { useRef } from "react";
import type { PointerEvent, ReactNode } from "react";

// Hiệu ứng "nam châm" (nút hơi trôi theo hướng con trỏ khi rê gần) - port đúng logic JS của bản Stitch
// tham khảo, không cần thư viện thêm. Bỏ qua khi prefers-reduced-motion để tránh chuyển động thừa.
export function MagneticButton({ children, className }: { children: ReactNode; className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const wrap = wrapRef.current;
    const content = contentRef.current;
    if (!wrap || !content) return;
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    content.style.transition = "none";
    content.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
  }

  function handlePointerLeave() {
    const content = contentRef.current;
    if (!content) return;
    content.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)";
    content.style.transform = "translate(0px, 0px)";
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="inline-block"
    >
      <div ref={contentRef} className={className}>
        {children}
      </div>
    </div>
  );
}
