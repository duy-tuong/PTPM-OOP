"use client";

import { useState, type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import type { SessionUser } from "@/lib/types/auth";

// Sở hữu state đóng/mở Sidebar trên mobile (Sidebar + nút hamburger trong Topbar là 2 component
// riêng, cần 1 nơi chung giữ state) - mirror pattern Navbar/Sheet đã dùng ở public site nhưng tự viết
// tay (Sidebar cố định bên trái, không phải Sheet overlay từ phải qua như mobile nav public).
export function AdminShell({ session, children }: { session: SessionUser; children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar session={session} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
