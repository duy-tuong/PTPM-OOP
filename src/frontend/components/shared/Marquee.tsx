import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Marquee vô hạn dùng chung (TLD ticker + Partners ở Trang chủ redesign theo bản Stitch tham khảo).
// Chỉ CSS animation (globals.css .animate-marquee), không cần "use client". Nhận 1 bản `children`,
// tự nhân đôi để tạo vòng lặp liền mạch (bản sao thứ 2 aria-hidden).
// pauseOnHover mặc định false - giữ nguyên hành vi cũ cho TrustStrip (Partners) không đổi, chỉ bật
// tường minh ở nơi cần (Testimonials).
export function Marquee({
  children,
  gapClassName = "gap-16 pr-16",
  pauseOnHover = false,
}: {
  children: ReactNode;
  gapClassName?: string;
  pauseOnHover?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
        pauseOnHover && "group",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 animate-marquee items-center",
          gapClassName,
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          "flex shrink-0 animate-marquee items-center",
          gapClassName,
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
