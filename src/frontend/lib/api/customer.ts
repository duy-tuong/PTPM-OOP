import { apiFetch } from "./http";
import { getApiUrl } from "./config";
import type { PagedResult, PaginationParams } from "@/lib/types/common";
import type {
  CustomerProfileDto,
  UpdateCustomerProfileDto,
  ChangeCustomerPasswordDto,
  RequestEmailChangeDto,
} from "@/lib/types/customerAuth";
import type { MyOrderRequestDto, MyConsultationRequestDto } from "@/lib/types/sales";

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

export function getMyConsultationRequests(params: PaginationParams, token: string) {
  return apiFetch<PagedResult<MyConsultationRequestDto>>(getApiUrl(), "/consultation-requests/mine", "GET", {
    params,
    token,
  });
}
