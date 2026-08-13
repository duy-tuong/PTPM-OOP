import { apiFetch } from "./http";
import { getPublicApiUrl } from "./config";
import type {
  CreateOrderRequestDto,
  OrderRequestDto,
  CreateConsultationRequestDto,
  ConsultationRequestDto,
  CreateAffiliateApplicationDto,
  AffiliateApplicationDto,
} from "@/lib/types/sales";

// Gọi từ Client Component (form public ẩn danh, Phase 6.4) - fetch thẳng trình duyệt tới backend,
// đây là trường hợp DUY NHẤT cần CORS (đã bật ở Phase 6.0).
export function submitOrderRequest(dto: CreateOrderRequestDto) {
  return apiFetch<OrderRequestDto>(getPublicApiUrl(), "/order-requests", "POST", { body: dto });
}

export function submitConsultationRequest(dto: CreateConsultationRequestDto) {
  return apiFetch<ConsultationRequestDto>(getPublicApiUrl(), "/consultation-requests", "POST", { body: dto });
}

export function submitAffiliateApplication(dto: CreateAffiliateApplicationDto) {
  return apiFetch<AffiliateApplicationDto>(getPublicApiUrl(), "/affiliate-applications", "POST", { body: dto });
}
