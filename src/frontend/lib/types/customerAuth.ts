// Khớp Application/Features/Customers/Auth/Dtos/*.cs

export interface CustomerRegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface CustomerLoginRequest {
  email: string;
  password: string;
}

export interface CustomerAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  fullName: string;
}

// Payload không nhạy cảm trả về từ Route Handler register/login (app/api/customer-auth/*.ts) cho
// client stash vào cookie "customer_session" (KHÔNG httpOnly) - chỉ dùng để hiển thị UI (Navbar chào
// tên), KHÔNG dùng để authorize API call.
export interface CustomerSessionUser {
  fullName: string;
}
