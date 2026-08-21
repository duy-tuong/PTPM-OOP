// Tên cookie riêng biệt hoàn toàn với Customer (customerAuthCookies.ts) - tránh đụng tên nếu cùng lúc
// có phiên Customer lẫn Admin trên cùng trình duyệt (vd tab dev/test).
export const ADMIN_ACCESS_TOKEN_COOKIE = "admin_access_token";
export const ADMIN_REFRESH_TOKEN_COOKIE = "admin_refresh_token";
export const ADMIN_SESSION_COOKIE = "admin_session";

// Khớp JwtSettings.RefreshTokenExpiryDays mặc định (7 ngày) ở backend - giống lý do đã ghi ở
// customerAuthCookies.ts.
export const ADMIN_REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
