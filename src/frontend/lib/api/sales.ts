import { apiFetch } from "./http";
import { getApiUrl, getPublicApiUrl } from "./config";
import type {
  CreateOrderRequestDto,
  OrderRequestDto,
  OrderLookupDto,
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

// Endpoint public (không [Authorize] phía backend) - dùng cho trang /thanh-toan/[orderCode] mà link
// đã gửi qua email xác nhận đơn hàng có thể mở lại được mà không cần đăng nhập. no-store vì trạng thái
// đơn (New/Paid/...) có thể đổi bất cứ lúc nào sau khi Admin xác nhận đã nhận tiền.
export function getOrderByCode(orderCode: string) {
  return apiFetch<OrderLookupDto>(getApiUrl(), `/order-requests/by-code/${orderCode}`, "GET", { cache: "no-store" });
}

export function submitConsultationRequest(dto: CreateConsultationRequestDto) {
  return apiFetch<ConsultationRequestDto>(getPublicApiUrl(), "/consultation-requests", "POST", { body: dto });
}

export function submitAffiliateApplication(dto: CreateAffiliateApplicationDto) {
  return apiFetch<AffiliateApplicationDto>(getPublicApiUrl(), "/affiliate-applications", "POST", { body: dto });
}
