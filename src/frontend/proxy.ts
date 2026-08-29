import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import {
  CUSTOMER_ACCESS_TOKEN_COOKIE,
  CUSTOMER_REFRESH_TOKEN_COOKIE,
  CUSTOMER_ACCESS_EXPIRES_AT_COOKIE,
  CUSTOMER_REMEMBER_COOKIE,
  applyCustomerAuthCookies,
  clearCustomerAuthCookies,
} from "@/lib/auth/customerAuthCookies";
import { getApiUrl } from "@/lib/api/config";
import type { CustomerAuthResponse } from "@/lib/types/customerAuth";

// Đợt 12 - làm mới access token ngầm (silent refresh) trước khi thực sự hết hạn - trước đây middleware
// chỉ kiểm tra CÓ cookie access_token hay không, không kiểm tra CÒN HẠN, và không có gì làm mới token
// (refreshCustomerToken() tồn tại ở lib/api/customerAuth.ts nhưng chưa từng được gọi) nên phiên đăng
// nhập LUÔN chết sau đúng 30 phút (AccessTokenExpiryMinutes) bất kể có tick "Ghi nhớ đăng nhập" hay
// không. 30 giây đệm để tránh trường hợp hiếm token hết hạn đúng lúc request đang bay tới backend, giữa
// lúc middleware kiểm tra "còn hạn" và lúc trang thật sự dùng token để gọi API.
const REFRESH_BUFFER_MS = 30_000;

function isAccessTokenExpired(expiresAtRaw: string | undefined): boolean {
  if (!expiresAtRaw) return true;
  const expiresAt = Date.parse(expiresAtRaw);
  if (Number.isNaN(expiresAt)) return true;
  return expiresAt - REFRESH_BUFFER_MS <= Date.now();
}

// Timeout riêng cho lệnh gọi này - middleware chạy trên MỌI request tới /khach-hang/**, nếu backend
// tạm phản hồi chậm/treo (không phải lỗi hẳn, chỉ chậm) mà không có timeout thì cả trang sẽ treo theo
// thay vì fail nhanh về nhánh redirect /login sẵn có.
const REFRESH_FETCH_TIMEOUT_MS = 5_000;

async function refreshCustomerSession(refreshToken: string): Promise<CustomerAuthResponse | null> {
  try {
    const res = await fetch(`${getApiUrl()}/customer-auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      signal: AbortSignal.timeout(REFRESH_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as CustomerAuthResponse;
  } catch {
    // Backend tạm không phản hồi được (lỗi mạng hoặc timeout ở trên) - coi như làm mới thất bại, không
    // throw ra ngoài middleware.
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/khach-hang")) {
    const accessToken = request.cookies.get(CUSTOMER_ACCESS_TOKEN_COOKIE)?.value;
    const expiresAt = request.cookies.get(CUSTOMER_ACCESS_EXPIRES_AT_COOKIE)?.value;

    // Còn hạn - cho qua ngay, không gọi mạng (fast-path cho trường hợp thường gặp nhất, không ảnh
    // hưởng hiệu năng).
    if (accessToken && !isAccessTokenExpired(expiresAt)) {
      return NextResponse.next();
    }

    const refreshToken = request.cookies.get(CUSTOMER_REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const refreshed = await refreshCustomerSession(refreshToken);
    if (!refreshed) {
      // Refresh token cũng đã hết hạn/không hợp lệ (đăng xuất trên thiết bị khác, backend thu hồi...) -
      // dọn sạch cookie cũ luôn, tránh vòng lặp redirect vô ích ở lần request kế tiếp.
      const response = NextResponse.redirect(new URL("/login", request.url));
      clearCustomerAuthCookies(response);
      return response;
    }

    // Giữ nguyên đúng lựa chọn "Ghi nhớ đăng nhập" ban đầu cho lần làm mới này - KHÔNG mặc định
    // persistent:true, nếu không sẽ âm thầm "nâng cấp" 1 phiên "không ghi nhớ" thành ghi nhớ mỗi 30
    // phút khi đang duyệt, làm mất hẳn ý nghĩa của lựa chọn ban đầu (xem comment ở customerAuthCookies.ts).
    const remember = request.cookies.get(CUSTOMER_REMEMBER_COOKIE)?.value === "1";
    const response = NextResponse.next();
    applyCustomerAuthCookies(response, refreshed, { persistent: remember });
    return response;
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
