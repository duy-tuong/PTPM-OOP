"use client";

import type { SessionUser } from "@/lib/types/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/adminAuthCookies";

// Mirror lib/auth/customerSessionClient.ts#readCustomerSessionCookie, cho admin_session. Dùng ở
// AdminLoginForm.tsx để xác nhận cookie ĐÃ THỰC SỰ được Route Handler set vào trình duyệt trước khi báo
// đăng nhập thành công (xem comment trong AdminLoginForm.tsx - phòng trường hợp hạ tầng route sai request
// thẳng vào backend .NET, bỏ qua Route Handler, khiến backend trả 200 nhưng không cookie nào được set).
export function readAdminSessionCookie(): SessionUser | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  if (!match) {
    return null;
  }

  try {
    const raw = decodeURIComponent(match.slice(ADMIN_SESSION_COOKIE.length + 1));
    const parsed = JSON.parse(raw) as SessionUser;
    return typeof parsed.fullName === "string" && Array.isArray(parsed.roles) ? parsed : null;
  } catch {
    return null;
  }
}
