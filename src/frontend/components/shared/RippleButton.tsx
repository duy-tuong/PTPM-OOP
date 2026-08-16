"use client";

import { useRef } from "react";
import type { ButtonHTMLAttributes, MouseEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

// Hiệu ứng gợn sóng 3 vòng khi click - port đúng logic JS của bản Stitch tham khảo. Dùng phần tử DOM
// thật (<button> hoặc next/link <a> khi có href) vì cần ref DOM thật để append node ripple; style lại
// bằng buttonVariants cho khớp giao diện Button chuẩn của hệ thống.
function useRippleClick(reduceMotionCheck = true) {
  function trigger(el: HTMLElement, e: { clientX: number; clientY: number }) {
    const reduceMotion =
      reduceMotionCheck && typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const ripple = document.createElement("span");
        ripple.style.position = "absolute";
        ripple.style.borderRadius = "9999px";
        ripple.style.background =
          "radial-gradient(circle, rgba(255,255,255,0.85) 0%, color-mix(in oklch, var(--primary) 45%, transparent) 55%, transparent 100%)";
        ripple.style.width = "20px";
        ripple.style.height = "20px";
        ripple.style.left = `${x - 10}px`;
        ripple.style.top = `${y - 10}px`;
        ripple.style.pointerEvents = "none";
        el.appendChild(ripple);
        ripple.animate(
          [
            { transform: "scale(0)", opacity: 0.8 },
            { transform: "scale(20)", opacity: 0 },
          ],
          { duration: 800, easing: "ease-out" },
        );
        setTimeout(() => ripple.remove(), 800);
      }, i * 150);
    }
  }

  return trigger;
}

type RippleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { href?: string };

export function RippleButton({ className, variant, size, href, onClick, children, ...props }: RippleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const ripple = useRippleClick();

  if (href) {
    return (
      <Link
        ref={linkRef}
        href={href}
        onClick={(e) => {
          if (linkRef.current) ripple(linkRef.current, e);
        }}
        className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden")}
      >
        {children}
      </Link>
    );
  }

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    if (buttonRef.current) ripple(buttonRef.current, e);
    onClick?.(e);
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden")}
      {...props}
    >
      {children}
    </button>
  );
}
