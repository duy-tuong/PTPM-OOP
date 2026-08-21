"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/khach-hang", label: "Hồ sơ" },
  { href: "/khach-hang/doi-mat-khau", label: "Đổi mật khẩu" },
  { href: "/khach-hang/don-hang", label: "Đơn hàng của tôi" },
  { href: "/khach-hang/yeu-cau-tu-van", label: "Yêu cầu tư vấn của tôi" },
];

// Tab nav cho vùng /khach-hang - Client Component vì cần usePathname() để tô đậm mục đang xem (layout
// cha là Server Component, không có sẵn pathname). Cùng kiểu pill trắng-đen tự đảo theo theme đã dùng
// ở PillLink (NewsSplitScreen.tsx)/CustomerTypeToggle.tsx.
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 overflow-x-auto">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
