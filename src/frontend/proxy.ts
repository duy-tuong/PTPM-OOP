import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { CUSTOMER_ACCESS_TOKEN_COOKIE } from "@/lib/auth/customerAuthCookies";

// Next.js 16 đổi tên middleware.ts -> proxy.ts (export "proxy" thay vì "middleware") - đã verify trực
// tiếp trong node_modules/next/dist/docs trước khi viết. File PHẢI nằm ở root src/frontend (ngang hàng
// app/), không phải trong app/. Runtime cố định Node.js (không cấu hình được), không hỗ trợ edge nữa.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Whitelist /admin/login - không có cookie vẫn phải cho qua, nếu không sẽ tạo redirect loop
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/khach-hang")) {
    const customerToken = request.cookies.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value;
    if (!customerToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const accessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const proxy = middleware;

export const config = {
  matcher: ["/admin/:path*", "/khach-hang/:path*"],
};
