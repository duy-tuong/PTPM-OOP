import { apiFetch } from "./http";
import { getApiUrl, getPublicApiUrl } from "./config";
import type {
  CreateOrderRequestDto,
  OrderRequestDto,
  OrderLookupDto,
  CreateRenewalOrderRequestDto,
  CreateConsultationRequestDto,
  ConsultationRequestDto,
  CreateAffiliateApplicationDto,
  AffiliateApplicationDto,
  RequestPlanChangeDto,
  PlanChangePreviewDto,
  PlanChangeResultDto,
} from "@/lib/types/sales";

// Server-only (dùng getApiUrl) - gọi từ app/api/order-requests/route.ts, KHÔNG import trực tiếp từ
// Client Component. Token luôn bắt buộc - đặt hàng đòi hỏi đăng nhập (khớp
// [Authorize(Roles="Customer")] phía backend), không còn luồng ẩn danh như trước.
export function submitOrderRequest(dto: CreateOrderRequestDto, token: string) {
  return apiFetch<OrderRequestDto>(getApiUrl(), "/order-requests", "POST", { body: dto, token });
}

// Endpoint public (không [Authorize] phía backend) - dùng cho trang /thanh-toan/[orderCode] mà link
// đã gửi qua email xác nhận đơn hàng có thể mở lại được mà không cần đăng nhập. no-store vì trạng thái
// đơn (New/Paid/...) có thể đổi bất cứ lúc nào sau khi Admin xác nhận đã nhận tiền.
export function getOrderByCode(orderCode: string) {
  return apiFetch<OrderLookupDto>(getApiUrl(), `/order-requests/by-code/${orderCode}`, "GET", { cache: "no-store" });
}

// Browser-only (dùng getPublicApiUrl) - bản Client Component của getOrderByCode ở trên, dùng cho
// PaymentStatusPanel.tsx poll trạng thái đơn mỗi vài giây trong lúc chờ webhook PayOS. Cùng endpoint
// anonymous, không cần token (không có CustomerId nào để đính kèm - khác submitConsultationRequest,
// endpoint này chưa từng và sẽ không bao giờ gắn với 1 khách hàng cụ thể, xem comment OrderLookupDto.cs).
export function getOrderByCodePublic(orderCode: string) {
  return apiFetch<OrderLookupDto>(getPublicApiUrl(), `/order-requests/by-code/${orderCode}`, "GET", { cache: "no-store" });
}

// Khác submitOrderRequest: gia hạn không có luồng ẩn danh, token luôn bắt buộc (đúng
// [Authorize(Roles="Customer")] phía backend) - gọi từ app/api/order-requests/renewals/route.ts.
export function submitRenewalOrderRequest(dto: CreateRenewalOrderRequestDto, token: string) {
  return apiFetch<OrderRequestDto>(getApiUrl(), "/order-requests/mine/renewals", "POST", { body: dto, token });
}

// Server-only (dùng getApiUrl) - gọi từ app/api/consultation-requests/route.ts, KHÔNG import trực tiếp
// từ Client Component. Token không bắt buộc (endpoint vẫn công khai phía backend, xem comment
// ConsultationRequestsController.cs) nhưng PHẢI đính kèm khi khách đã đăng nhập, nếu không CustomerId
// sẽ luôn là null và yêu cầu sẽ không hiện ở trang "Yêu cầu tư vấn của tôi" dù đã đăng nhập lúc gửi.
export function submitConsultationRequest(dto: CreateConsultationRequestDto, token?: string) {
  return apiFetch<ConsultationRequestDto>(getApiUrl(), "/consultation-requests", "POST", { body: dto, token });
}

export function submitAffiliateApplication(dto: CreateAffiliateApplicationDto) {
  return apiFetch<AffiliateApplicationDto>(getPublicApiUrl(), "/affiliate-applications", "POST", { body: dto });
}

// Đổi gói (Phần 6) - luôn đòi hỏi đăng nhập (khớp [Authorize(Roles="Customer")] phía backend), gọi từ
// app/api/order-requests/items/[itemId]/change-plan/{preview,}/route.ts.
export function previewPlanChange(itemId: number, dto: RequestPlanChangeDto, token: string) {
  return apiFetch<PlanChangePreviewDto>(getApiUrl(), `/order-requests/items/${itemId}/change-plan/preview`, "POST", { body: dto, token });
}

export function submitPlanChange(itemId: number, dto: RequestPlanChangeDto, token: string) {
  return apiFetch<PlanChangeResultDto>(getApiUrl(), `/order-requests/items/${itemId}/change-plan`, "POST", { body: dto, token });
}
