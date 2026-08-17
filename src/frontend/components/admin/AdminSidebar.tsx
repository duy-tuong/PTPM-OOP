"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  MessageSquare,
  Handshake,
  Newspaper,
  FolderOpen,
  HelpCircle,
  FileText,
  Tag,
  History,
  Quote,
  Building2,
  Globe,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

// 15 mục, dùng route thật đã scaffold sẵn dưới app/admin/ - 3 mục không có route thật trong đề xuất
// gốc (VPS, Người dùng, Cài đặt) được thay bằng route liên quan gần nhất (xem plan Phase 6.6). Bổ
// sung ở Phase 6.9: news-categories/faqs/content-pages (làm ở 6.8 nhưng quên thêm vào sidebar) +
// affiliate-applications/audit-logs (route mới của chính 6.9). Bổ sung ở Phase 6.10 nhóm A+B:
// testimonials/partners/tld-pricing - sẽ tái cấu trúc thành nhóm có tiêu đề khi hết 6.10.
const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/service-plans", label: "Dịch vụ", icon: Package },
  { href: "/admin/service-categories", label: "Danh mục dịch vụ", icon: FolderTree },
  { href: "/admin/tld-pricing", label: "Bảng giá tên miền", icon: Globe },
  { href: "/admin/promotions", label: "Khuyến mãi", icon: Tag },
  { href: "/admin/order-requests", label: "Đơn hàng", icon: ShoppingCart },
  { href: "/admin/consultation-requests", label: "Yêu cầu tư vấn", icon: MessageSquare },
  { href: "/admin/affiliate-applications", label: "Đăng ký affiliate", icon: Handshake },
  { href: "/admin/news-articles", label: "Bài viết", icon: Newspaper },
  { href: "/admin/news-categories", label: "Danh mục tin tức", icon: FolderOpen },
  { href: "/admin/faqs", label: "Câu hỏi thường gặp", icon: HelpCircle },
  { href: "/admin/content-pages", label: "Trang nội dung", icon: FileText },
  { href: "/admin/testimonials", label: "Đánh giá khách hàng", icon: Quote },
  { href: "/admin/partners", label: "Đối tác", icon: Building2 },
  { href: "/admin/audit-logs", label: "Nhật ký hệ thống", icon: History },
];

export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-gray-900/30 lg:hidden" onClick={onClose} aria-hidden />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between px-6 pt-2">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 lg:hidden"
            aria-label="Đóng menu điều hướng"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-all duration-200",
                  isActive 
                    ? "text-zinc-900 bg-zinc-100/80 shadow-sm ring-1 ring-zinc-900/5" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
                )}
              >
                <Icon className={cn("size-4.5", isActive ? "text-zinc-900" : "text-zinc-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
