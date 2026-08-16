"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

// Port kỹ thuật mouse-parallax theo lớp (`data-depth`) của bản Stitch Claudverse: lớp nền di chuyển
// ngược hướng con trỏ, tính từ tâm viewport, lớp có `depth` càng lớn di chuyển càng nhiều. Dùng cho
// blob nền + ảnh orb ở Hero. Tự tắt khi prefers-reduced-motion.
export function ParallaxLayer({
  depth,
  className,
  children,
}: {
  depth: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMouseMove(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      const moveX = x * depth * -60;
      const moveY = y * depth * -60;
      el.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [depth]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
