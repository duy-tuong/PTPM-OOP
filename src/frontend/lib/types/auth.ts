// Khớp Application/Features/Auth/Dtos/*.cs

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  fullName: string;
  roles: string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Payload không nhạy cảm trả về từ Route Handler login (Phase 6.5) cho client stash vào AuthProvider
// - chỉ dùng để hiển thị UI (chào tên, ẩn/hiện menu theo role), KHÔNG dùng để authorize API call.
export interface SessionUser {
  fullName: string;
  roles: string[];
}
