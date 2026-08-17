"use client";

import { useState, type KeyboardEvent } from "react";
import { Menu, Search, Bell } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import type { SessionUser } from "@/lib/types/auth";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function AdminTopbar({ session, onMenuClick }: { session: SessionUser; onMenuClick: () => void }) {
  const [search, setSearch] = useState("");

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && search.trim()) {
      toast.info("Chức năng tìm kiếm đang được phát triển");
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-700 lg:hidden"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="size-5" />
        </button>

        <div className="relative hidden max-w-sm flex-1 sm:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Tìm kiếm..."
            className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button type="button" className="text-gray-500 hover:text-gray-700" aria-label="Thông báo">
          <Bell className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>{getInitials(session.fullName)}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium text-gray-900">{session.fullName}</span>
            <span className="text-xs text-gray-500">{session.roles.join(", ")}</span>
          </div>
        </div>

        <AdminLogoutButton />
      </div>
    </header>
  );
}
