"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LockKey, Receipt, HardDrives, Headset, SquaresFour } from "@phosphor-icons/react";
import { readCustomerSessionCookie, CUSTOMER_SESSION_CHANGED_EVENT } from "@/lib/auth/customerSessionClient";

const LINKS = [
  { href: "/khach-hang", label: "Tổng quan", icon: SquaresFour },
  { href: "/khach-hang/doi-mat-khau", label: "Đổi mật khẩu", icon: LockKey },
  { href: "/khach-hang/don-hang", label: "Lịch sử đơn hàng", icon: Receipt },
  { href: "/khach-hang/dich-vu", label: "Dịch vụ của tôi", icon: HardDrives },
  { href: "/khach-hang/yeu-cau-tu-van", label: "Yêu cầu tư vấn", icon: Headset },
];

export function AccountNav() {
  const pathname = usePathname();
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    function loadSession() {
      const session = readCustomerSessionCookie();
      if (session?.fullName) {
        setFullName(session.fullName);
      }
    }
    loadSession();

    window.addEventListener(CUSTOMER_SESSION_CHANGED_EVENT, loadSession);
    return () => window.removeEventListener(CUSTOMER_SESSION_CHANGED_EVENT, loadSession);
  }, []);

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CV";

  return (
    <div className="flex flex-col gap-6">
      <div className="hidden md:flex flex-col items-center text-center p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
        <div className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold mb-3">
          {initials}
        </div>
        <h2 className="text-[15px] font-semibold text-foreground leading-tight">{fullName || "Thành viên"}</h2>
        <p className="text-xs text-muted-foreground mt-1">Tài khoản Cloudverse</p>
      </div>

      <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
        <h3 className="hidden md:block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
          Tài khoản
        </h3>
        {LINKS.map((link) => {
          // Xử lý active state: /khach-hang trỏ về Tổng quan, /khach-hang/ho-so là Hồ sơ cá nhân.
          // Vì trước đó /khach-hang là Hồ sơ, giờ chuyển lại. Cần map đúng:
          const active = pathname === link.href || (link.href === "/khach-hang" && pathname === "/khach-hang");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-all duration-150 relative",
                active 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon className="size-[18px] shrink-0" weight={active ? "fill" : "regular"} />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
