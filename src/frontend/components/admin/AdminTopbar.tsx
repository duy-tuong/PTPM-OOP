"use client";

import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SessionUser } from "@/lib/types/auth";

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function AdminTopbar({ session, onMenuClick }: { session: SessionUser; onMenuClick: () => void }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/70 backdrop-blur-xl px-6">
      <div className="flex flex-1 items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="text-zinc-500 hover:text-zinc-900 lg:hidden"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="size-5" />
        </button>

        <AdminCommandPalette />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-white p-1 ring-1 ring-zinc-200 shadow-sm">
          <button type="button" className="relative flex size-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900" aria-label="Thông báo">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 block size-1.5 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center outline-none">
              <Avatar size="sm" className="size-8 cursor-pointer ring-1 ring-zinc-200">
              <AvatarFallback className="bg-slate-100 text-xs font-medium text-slate-700">
                {getInitials(session.fullName)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-zinc-900">{session.fullName}</p>
                  <p className="text-xs leading-none text-slate-500">{session.roles.join(", ")}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer text-[13px] text-slate-600 focus:bg-slate-50 focus:text-zinc-900">
                <User className="mr-2 size-4" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-[13px] text-slate-600 focus:bg-slate-50 focus:text-zinc-900">
                <Settings className="mr-2 size-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              className="cursor-pointer text-[13px] text-red-600 focus:bg-red-50 focus:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 size-4" />
              <span>Đăng xuất</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
