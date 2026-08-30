import type { NextResponse } from "next/server";
import type { CustomerAuthResponse } from "@/lib/types/customerAuth";

// Tên cookie + hằng số + logic set/xoá cookie dùng chung giữa code server-only
// (customerSession.ts, dùng next/headers), code client (customerSessionClient.ts, đọc document.cookie),
// và middleware Edge (proxy.ts, dùng next/server) - tách riêng file này (KHÔNG import next/headers) để
// cả 3 ngữ cảnh import được, không kéo theo lỗi bundle "next/headers chỉ dùng được ở Server
// Component/Route Handler, không dùng được ở Edge Middleware".
export const CUSTOMER_ACCESS_TOKEN_COOKIE = "customer_access_token";
export const CUSTOMER_REFRESH_TOKEN_COOKIE = "customer_refresh_token";
export const CUSTOMER_SESSION_COOKIE = "customer_session";
// Đợt 12 - lưu ExpiresAtUtc (ISO string) của access token hiện tại, để proxy.ts (middleware) biết khi
// nào cần làm mới token mà KHÔNG cần giải mã JWT ở Edge runtime - chỉ so sánh timestamp, rẻ và nhanh.
export const CUSTOMER_ACCESS_EXPIRES_AT_COOKIE = "customer_access_expires_at";
// Đợt 12 - ghi lại đúng lựa chọn "Ghi nhớ đăng nhập" ban đầu, để proxy.ts biết nên set cookie mới (sau
// khi làm mới token) là persistent (7 ngày) hay session-only, KHÔNG được suy đoán/mặc định luôn persistent
// khi làm mới - nếu không sẽ âm thầm "nâng cấp" 1 phiên "không ghi nhớ" thành ghi nhớ mỗi lần token được
// làm mới (xảy ra mỗi 30 phút khi đang duyệt), làm mất hẳn ý nghĩa của lựa chọn ban đầu. Cookie này tự
// vẫn tuân theo persistent giống các cookie khác - nếu trình duyệt đã đóng (phiên "không ghi nhớ" đã bị
// xoá sạch) thì refresh_token cũng đã mất theo, middleware sẽ không bao giờ tới nhánh cần đọc cờ này.
export const CUSTOMER_REMEMBER_COOKIE = "customer_remember";

// Khớp JwtSettings.RefreshTokenExpiryDays mặc định (7 ngày) ở backend - response đăng nhập/đăng ký
// không trả lại hạn refresh token nên hardcode theo default, chấp nhận được vì chỉ ảnh hưởng UX
// (bắt đăng nhập lại sớm hơn 1 chút nếu backend đổi default) chứ không ảnh hưởng bảo mật thật (access
// token vẫn hết hạn đúng theo expiresAtUtc backend trả về).
export const CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

// Dùng chung cho Route Handler register/login (app/api/customer-auth/{register,login}/route.ts) VÀ
// middleware proxy.ts (làm mới token ngầm - Đợt 12) - set 4 cookie httpOnly (access/refresh/expiresAt/
// remember) + 1 cookie thường (customer_session, chỉ để Navbar hiển thị tên, không dùng để authorize).
// `persistent=false` (checkbox "Ghi nhớ đăng nhập" bỏ tick) bỏ maxAge cho TẤT CẢ 5 cookie -> tự xoá khi
// đóng trình duyệt thay vì tồn tại 7 ngày.
//
// Đợt 12 - trước đây CHỈ 2/3 cookie (refresh_token, customer_session) tuân theo `persistent`, còn
// access_token LUÔN có maxAge 7 ngày bất kể lựa chọn này - đây là cookie DUY NHẤT thực sự dùng để xác
// thực (middleware + mọi API call), nên bỏ tick "Ghi nhớ" không thực sự đăng xuất khi đóng trình duyệt.
// Đã sửa: áp `persistent` đồng nhất cho cả 5 cookie.
export function applyCustomerAuthCookies(
  response: NextResponse,
  result: CustomerAuthResponse,
  options: { persistent?: boolean } = {},
): void {
  const persistent = options.persistent ?? true;
  // secure: chỉ bật ở production (Vercel/Docker build với NODE_ENV=production) - dev local vẫn chạy
  // http://localhost nên không thể bật secure ở đó (trình duyệt sẽ âm thầm từ chối set cookie).
  const secure = process.env.NODE_ENV === "production";
  const maxAgeOption = persistent ? { maxAge: CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS } : {};

  response.cookies.set(CUSTOMER_ACCESS_TOKEN_COOKIE, result.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    ...maxAgeOption,
  });
  response.cookies.set(CUSTOMER_REFRESH_TOKEN_COOKIE, result.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    ...maxAgeOption,
  });
  response.cookies.set(CUSTOMER_ACCESS_EXPIRES_AT_COOKIE, result.expiresAtUtc, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    ...maxAgeOption,
  });
  response.cookies.set(CUSTOMER_REMEMBER_COOKIE, persistent ? "1" : "0", {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    ...maxAgeOption,
  });
  // KHÔNG tự encodeURIComponent() giá trị JSON ở đây - NextResponse.cookies.set() (qua thư viện `cookie`
  // Next.js dùng nội bộ) đã tự động percent-encode value khi serialize Set-Cookie. Tự encode thêm 1 lớp
  // nữa gây double-encode: server đọc lại qua cookies() (tự động decode tương ứng) vẫn parse JSON đúng
  // (chỉ dư 1 lớp encode CỦA CHÍNH MÌNH thêm vào, decode thủ công 1 lần ở getCustomerSession() undo đúng
  // lớp đó) NHƯNG phía client đọc qua document.cookie (KHÔNG tự decode gì cả, khác cookies() ở server) -
  // readCustomerSessionCookie() chỉ decodeURIComponent 1 lần nên còn dư đúng 1 lớp encode, JSON.parse
  // luôn fail âm thầm (raw vẫn bắt đầu bằng "%7B" chứ không phải "{"), Navbar không bao giờ đọc được
  // session dù cookie đã set đúng - bug thật, phát hiện khi thêm bước kiểm tra cookie sau login (xem
  // components/auth/LoginForm.tsx).
  response.cookies.set(CUSTOMER_SESSION_COOKIE, JSON.stringify({ fullName: result.fullName, email: result.email }), {
    httpOnly: false,
    sameSite: "lax",
    secure,
    path: "/",
    ...maxAgeOption,
  });
}

// Dùng cho Route Handler logout + middleware (khi refresh token không còn hợp lệ) - xoá cả 5 cookie.
export function clearCustomerAuthCookies(response: NextResponse): void {
  response.cookies.set(CUSTOMER_ACCESS_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CUSTOMER_REFRESH_TOKEN_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CUSTOMER_ACCESS_EXPIRES_AT_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CUSTOMER_REMEMBER_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
}
