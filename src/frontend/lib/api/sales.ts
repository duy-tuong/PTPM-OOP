import { apiFetch } from "./http";
import { getApiUrl, getPublicApiUrl } from "./config";
import type {
  CreateOrderRequestDto,
  OrderRequestDto,
  CreateConsultationRequestDto,
  ConsultationRequestDto,
  CreateAffiliateApplicationDto,
  AffiliateApplicationDto,
} from "@/lib/types/sales";

// Server-only (dùng getApiUrl) - gọi từ app/api/order-requests/route.ts, KHÔNG import trực tiếp từ
// Client Component. Nhận token tuỳ chọn: nếu khách đã đăng nhập, backend gán CustomerId cho đơn hàng
// (OrderRequestsController đọc role "Customer" từ JWT); nếu không có token, đơn vẫn tạo được (ẩn danh).
export function submitOrderRequest(dto: CreateOrderRequestDto, token?: string) {
  return apiFetch<OrderRequestDto>(getApiUrl(), "/order-requests", "POST", { body: dto, token });
}

export function submitConsultationRequest(dto: CreateConsultationRequestDto) {
  return apiFetch<ConsultationRequestDto>(getPublicApiUrl(), "/consultation-requests", "POST", { body: dto });
}

export function submitAffiliateApplication(dto: CreateAffiliateApplicationDto) {
  return apiFetch<AffiliateApplicationDto>(getPublicApiUrl(), "/affiliate-applications", "POST", { body: dto });
}
