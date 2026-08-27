import { apiFetch } from "./http";
import { getApiUrl } from "./config";
import type { PagedResult, PaginationParams } from "@/lib/types/common";
import type {
  CustomerProfileDto,
  UpdateCustomerProfileDto,
  ChangeCustomerPasswordDto,
  RequestEmailChangeDto,
} from "@/lib/types/customerAuth";
import type {
  MyOrderRequestDto,
  MyServiceItemDto,
  MyConsultationRequestDto,
  CustomerSshKeyDto,
  CreateSshKeyDto,
  CustomerNotificationDto,
} from "@/lib/types/sales";

// Server-only - gọi các endpoint tự phục vụ [Authorize(Roles="Customer")], dùng trong
// app/khach-hang/** (Server Component đọc token qua getCustomerAccessToken()) và các Route Handler
// app/api/customer-auth/{me,change-password}/route.ts (Client Component không đọc được cookie httpOnly).
export function getMyProfile(token: string) {
  return apiFetch<CustomerProfileDto>(getApiUrl(), "/customer-auth/me", "GET", { token });
}

export function updateMyProfile(dto: UpdateCustomerProfileDto, token: string) {
  return apiFetch<CustomerProfileDto>(getApiUrl(), "/customer-auth/me", "PUT", { body: dto, token });
}

export function changeMyPassword(dto: ChangeCustomerPasswordDto, token: string) {
  return apiFetch<void>(getApiUrl(), "/customer-auth/change-password", "POST", { body: dto, token });
}

export function requestEmailChange(dto: RequestEmailChangeDto, token: string) {
  return apiFetch<void>(getApiUrl(), "/customer-auth/change-email/request", "POST", { body: dto, token });
}

export function getMyOrders(params: PaginationParams, token: string) {
  return apiFetch<PagedResult<MyOrderRequestDto>>(getApiUrl(), "/order-requests/mine", "GET", { params, token });
}

export function getMyServices(params: PaginationParams, token: string) {
  return apiFetch<PagedResult<MyServiceItemDto>>(getApiUrl(), "/order-requests/mine/services", "GET", { params, token });
}

export function getMyConsultationRequests(params: PaginationParams, token: string) {
  return apiFetch<PagedResult<MyConsultationRequestDto>>(getApiUrl(), "/consultation-requests/mine", "GET", {
    params,
    token,
  });
}

// SSH Key (Đợt 3, Phần 12) - gọi từ app/api/customer/ssh-keys/**/route.ts.
export function getMySshKeys(token: string) {
  return apiFetch<CustomerSshKeyDto[]>(getApiUrl(), "/customer/ssh-keys", "GET", { token });
}

export function createMySshKey(dto: CreateSshKeyDto, token: string) {
  return apiFetch<CustomerSshKeyDto>(getApiUrl(), "/customer/ssh-keys", "POST", { body: dto, token });
}

export function deleteMySshKey(id: number, token: string) {
  return apiFetch<void>(getApiUrl(), `/customer/ssh-keys/${id}`, "DELETE", { token });
}

// Thông báo trong app (chuông Navbar) - gọi từ app/api/customer/notifications/**/route.ts, mirror
// đúng lý do dùng Route Handler như SSH Key ở trên (Client Component không đọc được cookie httpOnly).
export function getMyNotifications(token: string) {
  return apiFetch<CustomerNotificationDto[]>(getApiUrl(), "/customer/notifications", "GET", { token });
}

export function getMyUnreadNotificationCount(token: string) {
  return apiFetch<number>(getApiUrl(), "/customer/notifications/unread-count", "GET", { token });
}

export function markMyNotificationAsRead(id: number, token: string) {
  return apiFetch<void>(getApiUrl(), `/customer/notifications/${id}/read`, "POST", { token });
}

export function markAllMyNotificationsAsRead(token: string) {
  return apiFetch<void>(getApiUrl(), "/customer/notifications/read-all", "POST", { token });
}
