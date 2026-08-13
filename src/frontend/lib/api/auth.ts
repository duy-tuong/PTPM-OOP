import { apiFetch } from "./http";
import { getApiUrl } from "./config";
import type { LoginRequest, LoginResponse, RefreshTokenRequest, ChangePasswordRequest } from "@/lib/types/auth";

// Server-only - gọi từ các Route Handler app/api/auth/*.ts (Phase 6.5), KHÔNG gọi trực tiếp
// từ Client Component (token luôn nằm trong httpOnly cookie do Route Handler tự quản lý).
export function loginBackend(dto: LoginRequest) {
  return apiFetch<LoginResponse>(getApiUrl(), "/auth/login", "POST", { body: dto });
}

export function refreshTokenBackend(dto: RefreshTokenRequest) {
  return apiFetch<LoginResponse>(getApiUrl(), "/auth/refresh-token", "POST", { body: dto });
}

export function changePasswordBackend(dto: ChangePasswordRequest, token: string) {
  return apiFetch<void>(getApiUrl(), "/auth/change-password", "POST", { body: dto, token });
}

export function logoutBackend(token: string) {
  return apiFetch<void>(getApiUrl(), "/auth/logout", "POST", { token });
}
