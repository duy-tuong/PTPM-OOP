"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  MessageSquare,
  MessageCircle,
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
  Users,
  UserCog,
  Settings,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/lib/types/auth";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  // true = chỉ Admin thấy được (khớp [Authorize(Roles="Admin")] của controller tương ứng) - Editor bị
  // lọc khỏi sidebar. Dashboard KHÔNG đánh dấu dù dashboard-stats cũng Admin-only, vì trang vẫn còn
  // nội dung dùng được cho Editor (bảng Recent Orders) - tự bắt lỗi 403 riêng ở page.tsx.
  adminOnly?: boolean;
}

// 19 mục, dùng route thật đã scaffold sẵn dưới app/admin/. Tái cấu trúc thành nhóm có tiêu đề (thay
// mảng phẳng cũ) sau khi hoàn thành toàn bộ Phase 6.10 - flat list không còn phù hợp ở quy mô này.
const NAV_GROUPS: { section?: string; items: NavItem[] }[] = [
  {
    items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    section: "Danh mục & Giá",
    items: [
      { href: "/admin/service-plans", label: "Dịch vụ", icon: Package, adminOnly: true },
      { href: "/admin/service-categories", label: "Danh mục dịch vụ", icon: FolderTree, adminOnly: true },
      { href: "/admin/tld-pricing", label: "Bảng giá tên miền", icon: Globe, adminOnly: true },
      { href: "/admin/promotions", label: "Khuyến mãi", icon: Tag, adminOnly: true },
    ],
  },
  {
    section: "Nội dung",
    items: [
      { href: "/admin/news-articles", label: "Bài viết", icon: Newspaper },
      { href: "/admin/news-comments", label: "Bình luận", icon: MessageCircle },
      { href: "/admin/news-categories", label: "Danh mục tin tức", icon: FolderOpen },
      { href: "/admin/faqs", label: "Câu hỏi thường gặp", icon: HelpCircle },
      { href: "/admin/content-pages", label: "Trang nội dung", icon: FileText },
      { href: "/admin/testimonials", label: "Đánh giá khách hàng", icon: Quote },
      { href: "/admin/partners", label: "Đối tác", icon: Building2 },
    ],
  },
  {
    section: "Kinh doanh",
    items: [
      { href: "/admin/order-requests", label: "Đơn hàng", icon: ShoppingCart },
      { href: "/admin/consultation-requests", label: "Yêu cầu tư vấn", icon: MessageSquare },
      { href: "/admin/affiliate-applications", label: "Đăng ký affiliate", icon: Handshake },
      { href: "/admin/customers", label: "Khách hàng", icon: Users, adminOnly: true },
    ],
  },
  {
    section: "Hệ thống",
    items: [
      { href: "/admin/users", label: "Nhân viên", icon: UserCog, adminOnly: true },
      { href: "/admin/site-settings", label: "Cài đặt hệ thống", icon: Settings, adminOnly: true },
      { href: "/admin/audit-logs", label: "Nhật ký hệ thống", icon: History, adminOnly: true },
    ],
  },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  session: SessionUser;
}

export function AdminSidebar({ open, onClose, session }: AdminSidebarProps) {
  const pathname = usePathname();
  const isAdmin = session.roles.includes("Admin");

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

        <nav className="flex-1 space-y-4 overflow-y-auto p-4">
          {NAV_GROUPS.map((group, groupIndex) => {
            const visibleItems = group.items.filter((item) => !item.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.section ?? `group-${groupIndex}`} className="space-y-1">
                {group.section && (
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-zinc-400 uppercase">
                    {group.section}
                  </p>
                )}
                {visibleItems.map((item) => {
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
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
