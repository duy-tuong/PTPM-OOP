import type { ReactNode } from "react";

// Marquee vô hạn dùng chung (TLD ticker + Partners ở Trang chủ redesign theo bản Stitch tham khảo).
// Chỉ CSS animation (globals.css .animate-marquee), không cần "use client". Nhận 1 bản `children`,
// tự nhân đôi để tạo vòng lặp liền mạch (bản sao thứ 2 aria-hidden).
export function Marquee({ children, gapClassName = "gap-16 pr-16" }: { children: ReactNode; gapClassName?: string }) {
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className={`flex shrink-0 animate-marquee items-center ${gapClassName}`}>{children}</div>
      <div aria-hidden className={`flex shrink-0 animate-marquee items-center ${gapClassName}`}>
        {children}
      </div>
    </div>
  );
}
