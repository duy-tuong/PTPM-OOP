"use client";

import type { CustomerSessionUser } from "@/lib/types/customerAuth";
import { CUSTOMER_SESSION_COOKIE } from "@/lib/auth/customerAuthCookies";

export const CUSTOMER_SESSION_CHANGED_EVENT = "customer-session-changed";

// Đọc cookie "customer_session" (KHÔNG httpOnly - đọc được từ document.cookie) trực tiếp ở Client
// Component thay vì đọc ở Server Component/layout - tránh biến toàn bộ route group (public) thành
// dynamic render (Next.js buộc mọi route dùng chung layout gọi cookies()/headers() thành dynamic,
// làm mất hết SSG/ISR (revalidate) đã cấu hình riêng cho từng trang public ở các phase trước).
export function readCustomerSessionCookie(): CustomerSessionUser | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CUSTOMER_SESSION_COOKIE}=`));

  if (!match) {
    return null;
  }

  try {
    const raw = decodeURIComponent(match.slice(CUSTOMER_SESSION_COOKIE.length + 1));
    const parsed = JSON.parse(raw) as CustomerSessionUser;
    return typeof parsed.fullName === "string" ? parsed : null;
  } catch {
    return null;
  }
}

// Login/Register/Logout gọi hàm này sau khi fetch Route Handler thành công để Navbar (mount ở layout,
// không remount khi điều hướng) tự đọc lại cookie và cập nhật UI ngay, không cần đợi full page reload.
export function notifyCustomerSessionChanged(): void {
  window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED_EVENT));
}
