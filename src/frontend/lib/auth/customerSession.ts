import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { CustomerAuthResponse, CustomerSessionUser } from "@/lib/types/customerAuth";
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth/customerAuthCookies";

export { CUSTOMER_ACCESS_TOKEN_COOKIE, CUSTOMER_REFRESH_TOKEN_COOKIE, CUSTOMER_SESSION_COOKIE };

// Dùng chung cho Route Handler register + login (app/api/customer-auth/{register,login}/route.ts) -
// set 2 cookie httpOnly (access/refresh token thật) + 1 cookie thường (customer_session, chỉ để Navbar
// hiển thị tên, không dùng để authorize). `persistent=false` (checkbox "Ghi nhớ đăng nhập" bỏ tick ở
// LoginForm) bỏ qua maxAge cho refresh/session cookie -> thành session cookie, tự xoá khi đóng trình
// duyệt thay vì tồn tại 7 ngày; access token luôn giữ đúng hạn thật bất kể lựa chọn này.
export function applyCustomerAuthCookies(
  response: NextResponse,
  result: CustomerAuthResponse,
  options: { persistent?: boolean } = {},
): void {
  const persistent = options.persistent ?? true;
  const accessTokenMaxAge = Math.max(1, Math.round((new Date(result.expiresAtUtc).getTime() - Date.now()) / 1000));

  response.cookies.set(CUSTOMER_ACCESS_TOKEN_COOKIE, result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: accessTokenMaxAge,
  });
  response.cookies.set(CUSTOMER_REFRESH_TOKEN_COOKIE, result.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    ...(persistent ? { maxAge: CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS } : {}),
  });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, JSON.stringify({ fullName: result.fullName }), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    ...(persistent ? { maxAge: CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS } : {}),
  });
}

// Dùng cho Route Handler logout - xoá cả 3 cookie.
export function clearCustomerAuthCookies(response: NextResponse): void {
  response.cookies.set(CUSTOMER_ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CUSTOMER_REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

// Server-only - đọc cookie "customer_session" cho Server Component nào thật sự cần biết trạng thái
// đăng nhập trước khi render (vd 1 trang customer-only sau này). KHÔNG dùng ở app/(public)/layout.tsx
// dùng chung cho mọi trang public - gọi cookies() ở đó sẽ ép toàn bộ route group thành dynamic render,
// mất hết SSG/ISR (revalidate) đã cấu hình riêng từng trang. Navbar dùng
// lib/auth/customerSessionClient.ts (đọc document.cookie phía client) thay vì hàm này.
export async function getCustomerSession(): Promise<CustomerSessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as CustomerSessionUser;
    if (typeof parsed.fullName !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// Server-only - đọc access token thật (httpOnly) để gọi các endpoint /customer-auth/me,
// /order-requests/mine,... thay mặt khách hàng. Dùng trong app/khach-hang/** (route riêng, đã bị
// proxy.ts chặn theo CUSTOMER_ACCESS_TOKEN_COOKIE trước khi tới đây) hoặc trong Route Handler dưới
// app/api/** (vd order-requests/route.ts, customer-auth/change-password/route.ts) - Route Handler vốn
// đã dynamic-per-request nên gọi cookies() ở đây không kéo theo rủi ro mất SSG như nêu ở
// getCustomerSession(). KHÔNG gọi trực tiếp trong 1 Server Component/layout dùng chung ở app/(public)/**.
export async function getCustomerAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value;
}
