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
    const parsed = JSON.parse(raw) as Partial<CustomerSessionUser>;
    // email bắt buộc phải có (không chỉ fullName) - CartContext.tsx dùng nó làm khoá giỏ hàng riêng
    // theo tài khoản; cookie cũ (set trước khi thêm field này) sẽ tự hết hạn/được ghi đè lại đúng khi
    // middleware làm mới token hoặc lần đăng nhập kế tiếp, không cần xử lý di trú thủ công.
    return typeof parsed.fullName === "string" && typeof parsed.email === "string"
      ? (parsed as CustomerSessionUser)
      : null;
  } catch {
    return null;
  }
}

// Login/Register/Logout gọi hàm này sau khi fetch Route Handler thành công để Navbar (mount ở layout,
// không remount khi điều hướng) tự đọc lại cookie và cập nhật UI ngay, không cần đợi full page reload.
export function notifyCustomerSessionChanged(): void {
  window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED_EVENT));
}
