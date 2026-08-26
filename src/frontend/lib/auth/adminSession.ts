import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import type { LoginResponse, SessionUser } from "@/lib/types/auth";
import {
  ADMIN_ACCESS_TOKEN_COOKIE,
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_SESSION_COOKIE,
  ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth/adminAuthCookies";

export { ADMIN_ACCESS_TOKEN_COOKIE, ADMIN_REFRESH_TOKEN_COOKIE, ADMIN_SESSION_COOKIE };

// Dùng cho Route Handler app/api/auth/login/route.ts - set 2 cookie httpOnly (access/refresh token
// thật) + 1 cookie thường (admin_session, chỉ để hiển thị UI - {fullName, roles}), mirror
// lib/auth/customerSession.ts#applyCustomerAuthCookies.
export function applyAdminAuthCookies(response: NextResponse, result: LoginResponse): void {
  const accessTokenMaxAge = ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS;
  response.cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: accessTokenMaxAge,
  });
  response.cookies.set(ADMIN_REFRESH_TOKEN_COOKIE, result.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    JSON.stringify({ fullName: result.fullName, roles: result.roles }),
    {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS,
    },
  );
}

// Dùng cho Route Handler logout - xoá cả 3 cookie.
export function clearAdminAuthCookies(response: NextResponse): void {
  response.cookies.set(ADMIN_ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(ADMIN_REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}

// Server-only - đọc cookie "admin_session" trực tiếp trong Server Component (app/admin/layout.tsx).
// KHÁC lib/auth/customerSession.ts#getCustomerSession (chỉ dùng cho page customer-only, tránh gọi ở
// layout dùng chung vì sẽ mất SSG) - ở đây AN TOÀN gọi thẳng vì mọi route /admin/** đã bị proxy.ts
// chặn yêu cầu đăng nhập, vốn dĩ luôn dynamic/cá nhân hoá, không có SSG nào để mất.
export async function getAdminSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (typeof parsed.fullName !== "string" || !Array.isArray(parsed.roles)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
