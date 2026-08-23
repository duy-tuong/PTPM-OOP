import { apiFetch } from "./http";
import { getApiUrl } from "./config";
import type { RefreshTokenRequest } from "@/lib/types/auth";
import type {
  CustomerRegisterRequest,
  CustomerLoginRequest,
  CustomerAuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/lib/types/customerAuth";

// Server-only - gọi từ Route Handler app/api/customer-auth/*.ts, KHÔNG gọi trực tiếp từ Client
// Component (token luôn nằm trong httpOnly cookie do Route Handler tự quản lý). Mirror lib/api/auth.ts.
export function registerCustomer(dto: CustomerRegisterRequest) {
  return apiFetch<CustomerAuthResponse>(getApiUrl(), "/customer-auth/register", "POST", { body: dto });
}

export function loginCustomer(dto: CustomerLoginRequest) {
  return apiFetch<CustomerAuthResponse>(getApiUrl(), "/customer-auth/login", "POST", { body: dto });
}

export function refreshCustomerToken(dto: RefreshTokenRequest) {
  return apiFetch<CustomerAuthResponse>(getApiUrl(), "/customer-auth/refresh-token", "POST", { body: dto });
}

export function logoutCustomer(token: string) {
  return apiFetch<void>(getApiUrl(), "/customer-auth/logout", "POST", { token });
}

// Anonymous - gọi trực tiếp từ Server Component (app/khach-hang/xac-thuc-email/page.tsx) đọc searchParams,
// không cần Route Handler vì không phải POST từ Client Component và không cần cookie.
export function confirmEmailChange(token: string) {
  return apiFetch<void>(getApiUrl(), "/customer-auth/change-email/confirm", "GET", { params: { token } });
}

export function forgotPassword(dto: ForgotPasswordRequest) {
  return apiFetch<void>(getApiUrl(), "/customer-auth/forgot-password", "POST", { body: dto });
}

export function resetPassword(dto: ResetPasswordRequest) {
  return apiFetch<void>(getApiUrl(), "/customer-auth/reset-password", "POST", { body: dto });
}
