// Tên cookie + hằng số dùng chung giữa code server-only (customerSession.ts, dùng next/headers) và
// code client (customerSessionClient.ts, đọc document.cookie) - tách riêng file này (không import
// next/headers/next/server) để phía client import được mà không kéo theo lỗi bundle "next/headers chỉ
// dùng được ở Server Component".
export const CUSTOMER_ACCESS_TOKEN_COOKIE = "customer_access_token";
export const CUSTOMER_REFRESH_TOKEN_COOKIE = "customer_refresh_token";
export const CUSTOMER_SESSION_COOKIE = "customer_session";

// Khớp JwtSettings.RefreshTokenExpiryDays mặc định (7 ngày) ở backend - response đăng nhập/đăng ký
// không trả lại hạn refresh token nên hardcode theo default, chấp nhận được vì chỉ ảnh hưởng UX
// (bắt đăng nhập lại sớm hơn 1 chút nếu backend đổi default) chứ không ảnh hưởng bảo mật thật (access
// token vẫn hết hạn đúng theo expiresAtUtc backend trả về).
export const CUSTOMER_REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
