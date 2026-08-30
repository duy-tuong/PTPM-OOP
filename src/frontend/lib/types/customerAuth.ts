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
  // Định danh ổn định theo tài khoản (unique) - dùng để tách riêng giỏ hàng từng khách trên cùng 1
  // trình duyệt, xem CartContext.tsx.
  email: string;
}

// Payload không nhạy cảm trả về từ Route Handler register/login (app/api/customer-auth/*.ts) cho
// client stash vào cookie "customer_session" (KHÔNG httpOnly) - chỉ dùng để hiển thị UI (Navbar chào
// tên) và làm khoá giỏ hàng riêng theo tài khoản (CartContext.tsx), KHÔNG dùng để authorize API call.
export interface CustomerSessionUser {
  fullName: string;
  email: string;
}

// Khớp Application/Features/Customers/Auth/Dtos/CustomerProfileDto.cs - customerType là chuỗi tên
// enum ("Individual"/"Business", đã .ToString() ở service) - dùng chung CUSTOMER_TYPE_LABELS
// (lib/types/enums.ts) để hiển thị, khác UpdateCustomerProfileDto (ghi) phải gửi số nguyên.
export interface CustomerProfileDto {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  customerType: string;
  companyName?: string | null;
  taxCode?: string | null;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

// Khớp Application/Features/Customers/Auth/Dtos/UpdateCustomerProfileDto.cs
export interface UpdateCustomerProfileDto {
  fullName: string;
  phone: string;
  customerType: number;
  companyName?: string;
  taxCode?: string;
}

// Khớp Application/Features/Auth/Dtos/ChangePasswordRequest.cs (dùng chung với staff Auth feature).
export interface ChangeCustomerPasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Khớp Application/Features/Customers/Auth/Dtos/RequestEmailChangeDto.cs
export interface RequestEmailChangeDto {
  newEmail: string;
}

// Khớp Application/Features/Customers/Auth/Dtos/ForgotPasswordRequest.cs
export interface ForgotPasswordRequest {
  email: string;
}

// Khớp Application/Features/Customers/Auth/Dtos/ResetPasswordRequest.cs
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
