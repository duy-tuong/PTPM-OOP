"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDate } from "@/lib/utils";
import type { CustomerNotificationDto } from "@/lib/types/sales";

const POLL_INTERVAL_MS = 20000;

// Chuông thông báo trong app - báo khách khi Admin/Editor đổi trạng thái đơn hàng/yêu cầu tư vấn tới
// 1 mốc có ý nghĩa (mirror đúng danh sách đã gửi email, xem NotificationOrderObserver.cs/
// NotificationConsultationObserver.cs ở backend). Nơi gọi (Navbar.tsx) chỉ render component này trong
// nhánh đã đăng nhập, không cần tự kiểm tra session ở đây.
//
// Chỉ poll SỐ CHƯA ĐỌC định kỳ (nhẹ, 1 số nguyên) - danh sách đầy đủ chỉ tải khi khách thực sự mở
// dropdown, tránh tải + render lại toàn bộ danh sách mỗi 20 giây dù không ai đang xem.
//
// variant="icon" (mặc định, desktop) - nút tròn chỉ icon, mirror icon giỏ hàng cạnh nó.
// variant="row" (mobile Sheet) - hàng ngang icon + nhãn chữ + badge, mirror đúng hàng "Giỏ hàng" trong
// Sheet - cùng 1 component, chỉ đổi phần trigger để khớp bố cục từng nơi, không lặp lại toàn bộ logic
// fetch/poll/mark-read ở 2 file khác nhau.
export function NotificationBell({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<CustomerNotificationDto[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function pollUnreadCount() {
      try {
        const res = await fetch("/api/customer/notifications/unread-count");
        if (!res.ok) return;
        const count = (await res.json()) as number;
        if (!cancelled) setUnreadCount(count);
      } catch {
        // Lỗi mạng tạm thời - bỏ qua, tự thử lại ở lần poll tiếp theo.
      }
    }

    pollUnreadCount();
    const intervalId = setInterval(pollUnreadCount, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  async function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen || notifications !== null) return;

    try {
      const res = await fetch("/api/customer/notifications");
      if (res.ok) {
        setNotifications((await res.json()) as CustomerNotificationDto[]);
      }
    } catch {
      // Im lặng - dropdown hiện trạng thái rỗng, khách mở lại lần sau sẽ tự thử tải lại
      // (notifications vẫn null nên lần mở kế tiếp sẽ gọi lại fetch).
    }
  }

  function handleItemClick(notification: CustomerNotificationDto) {
    if (notification.isRead) return;
    setNotifications((prev) => prev?.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)) ?? prev);
    setUnreadCount((prev) => Math.max(0, prev - 1));
    fetch(`/api/customer/notifications/${notification.id}/read`, { method: "POST" }).catch(() => {
      // Im lặng - đã cập nhật UI tại chỗ, lần poll/mở dropdown tiếp theo sẽ tự đồng bộ lại nếu lệch.
    });
  }

  function handleMarkAllRead() {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev?.map((n) => ({ ...n, isRead: true })) ?? prev);
    setUnreadCount(0);
    fetch("/api/customer/notifications/read-all", { method: "POST" }).catch(() => {
      // Im lặng - mirror handleItemClick.
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      {variant === "row" ? (
        <DropdownMenuTrigger
          aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"}
          className="flex items-center justify-between text-base font-medium text-muted-foreground outline-none hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Bell className="size-5" />
            Thông báo
          </span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"}
          className="relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] leading-none font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent align="end" className="w-80" sideOffset={12}>
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 text-sm font-semibold">Thông báo</DropdownMenuLabel>
          </DropdownMenuGroup>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-primary hover:underline"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications === null ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">Đang tải...</p>
        ) : notifications.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">Chưa có thông báo nào.</p>
        ) : (
          <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleItemClick(notification)}
                className={cn(
                  "flex-col items-start gap-0.5 whitespace-normal py-2",
                  !notification.isRead && "bg-primary/5",
                )}
                render={notification.linkUrl ? <Link href={notification.linkUrl} /> : undefined}
              >
                <span className="text-sm font-medium text-foreground">{notification.title}</span>
                <span className="text-xs text-muted-foreground">{notification.message}</span>
                <span className="text-[11px] text-muted-foreground/70">{formatDate(notification.createdAt)}</span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
