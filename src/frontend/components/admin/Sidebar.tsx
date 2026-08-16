"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  FileText,
  Megaphone,
  Users,
  Settings,
  ChevronRight,
  Sparkles,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";

// Phân nhóm Sidebar để giao diện có cấu trúc và tự nhiên hơn
const navigationGroups = [
  {
    title: "Tổng quan",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "Quản lý kinh doanh",
    items: [
      { name: "Catalog", href: "/admin/catalog/services", icon: Box },
      { name: "Sales", href: "/admin/sales/orders", icon: ShoppingCart, badge: "12" }, // Giả lập badge thực tế
    ],
  },
  {
    title: "Tăng trưởng & Nội dung",
    items: [
      { name: "Content", href: "/admin/content/news", icon: FileText },
      { name: "Marketing", href: "/admin/marketing/promotions", icon: Megaphone },
      { name: "Identity", href: "/admin/identity/customers", icon: Users },
    ],
  },
  {
    title: "Cấu hình",
    items: [
      { name: "System", href: "/admin/system/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // Logic kiểm tra active chuẩn hơn
  const isItemActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    const basePrefix = href.split("/").slice(0, 3).join("/");
    return pathname.startsWith(basePrefix);
  };

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-slate-200/80 bg-white">
      <div className="flex h-full flex-col justify-between">

        {/* Upper Section */}
        <div className="flex flex-col gap-6 p-4">

          {/* Header / Workspace Switcher */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-slate-100/80 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shadow-sm shadow-blue-500/30 ring-2 ring-blue-600/10 shrink-0">
                CS
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-900 truncate">CloudStore Admin</span>
                <span className="text-[10px] text-slate-500 font-medium truncate">Enterprise Plan</span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-5">
            {navigationGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="flex flex-col gap-1">
                {/* Group Title */}
                <span className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  {group.title}
                </span>

                {/* Group Links */}
                <div className="mt-1 flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = isItemActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ease-in-out",
                          active
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <item.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              active
                                ? "text-white"
                                : "text-slate-400 group-hover:text-slate-600"
                            )}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>

                        {/* Badges / Active Indicator */}
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                active
                                  ? "bg-slate-800 text-blue-300"
                                  : "bg-blue-50 text-blue-600"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                          {active && (
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Section (User Profile & Plan/Help) */}
        <div className="p-4 border-t border-slate-100 flex flex-col gap-3">

          {/* Pro Banner Small Callout */}
          <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-3 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold">CloudStore v2.4</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              Tất cả hệ thống đang hoạt động bình thường.
            </p>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                A
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-800 truncate">Alex Morgan</span>
                <span className="text-[10px] text-slate-400 truncate">admin@cloudstore.io</span>
              </div>
            </div>
            <button
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>
    </aside>
  );
}