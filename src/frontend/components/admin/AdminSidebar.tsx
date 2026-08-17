"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderTree, ShoppingCart, MessageSquare, Newspaper, Tag, X } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

// 7 mục, dùng route thật đã scaffold sẵn dưới app/admin/ - 3 mục không có route thật trong đề xuất
// gốc (VPS, Người dùng, Cài đặt) được thay bằng route liên quan gần nhất (xem plan Phase 6.6).
const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/service-plans", label: "Dịch vụ", icon: Package },
  { href: "/admin/service-categories", label: "Danh mục dịch vụ", icon: FolderTree },
  { href: "/admin/order-requests", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/consultation-requests", label: "Yêu cầu tư vấn", icon: MessageSquare },
  { href: "/admin/news-articles", label: "Bài viết", icon: Newspaper },
  { href: "/admin/promotions", label: "Khuyến mãi", icon: Tag },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-gray-900/30 lg:hidden" onClick={onClose} aria-hidden />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50 transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 lg:hidden"
            aria-label="Đóng menu điều hướng"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
