import type { OrderRequestItemDto } from "@/lib/types/sales";


// itemKind="New" cố tình không có nhãn (đại đa số đơn) - chỉ 2 loại đặc biệt mới cần gắn nhãn để khách/
// Admin không hiểu nhầm UnitPrice/LineTotal là giá đầy đủ của sản phẩm (Renewal = giá gia hạn, có thể
// khác giá công khai do Grandfathering; PlanChange = số tiền PHỤ THU proration, KHÔNG phải giá cả gói).
export const ORDER_ITEM_KIND_LABELS: Record<string, string> = {
  Renewal: "Gia hạn",
  PlanChange: "Phụ thu đổi gói",
};


// Gộp về đúng 1 chỗ biểu thức fallback đang bị lặp y hệt ở nhiều nơi hiển thị đơn hàng
// (OrderRequestsTable.tsx/OrderStatusDialog.tsx/RecentOrdersTable.tsx/khach-hang/don-hang/page.tsx) -
// từ khi OrderRequest chuyển sang giỏ hàng nhiều dòng (OrderRequestItem), "sản phẩm của 1 đơn" không
// còn là 1 field đơn mà là danh sách items.
export function formatOrderItemLabel(item: OrderRequestItemDto): string {
  const name = item.servicePlanName ?? (item.domainName && item.tldName ? `${item.domainName}${item.tldName}` : "Sản phẩm");
  const kindLabel = ORDER_ITEM_KIND_LABELS[item.itemKind];
  return kindLabel ? `[${kindLabel}] ${name} x${item.quantity}` : `${name} x${item.quantity}`;
}


// Dunning Automation (Đợt 2, Phần 8) - nhãn cho DunningPolicy.ComputeLifecycleStatus (backend). "Active"
// cố tình không có nhãn riêng (trạng thái bình thường, đã thể hiện qua OrderStatusBadge) - chỉ 3 trạng
// thái bất thường mới cần cảnh báo thêm, xem LifecycleStatusBadge.tsx.
export const LIFECYCLE_STATUS_LABELS: Record<string, string> = {
  Overdue: "Quá hạn",
  Suspended: "Tạm khóa",
  Terminated: "Đã hủy",
};


// Tóm tắt 1 dòng cho các danh sách chật chỗ (bảng Admin) - tên item đầu tiên, kèm "+N khác" nếu đơn
// có nhiều hơn 1 dòng. Nơi có đủ chỗ hơn (modal OrderStatusDialog) nên liệt kê từng item riêng bằng
// formatOrderItemLabel thay vì gọi hàm này.
export function formatOrderProductSummary(items: OrderRequestItemDto[]): string {
  if (items.length === 0) return "-";
  const first = formatOrderItemLabel(items[0]);
  return items.length > 1 ? `${first} +${items.length - 1} khác` : first;
}


// Thứ tự "xấu dần" để chọn 1 trạng thái đại diện hiện lên bảng Admin (1 đơn có thể nhiều dòng, mỗi
// dòng 1 lifecycleStatus riêng) - Terminated đáng chú ý nhất, Active/null (bình thường) không đáng hiện.
const LIFECYCLE_SEVERITY: Record<string, number> = { Overdue: 1, Suspended: 2, Terminated: 3 };


export function getWorstLifecycleStatus(items: OrderRequestItemDto[]): string | null {
  let worst: string | null = null;
  let worstSeverity = 0;
  for (const item of items) {
    const severity = item.lifecycleStatus ? (LIFECYCLE_SEVERITY[item.lifecycleStatus] ?? 0) : 0;
    if (severity > worstSeverity) {
      worst = item.lifecycleStatus!;
      worstSeverity = severity;
    }
  }
  return worst;
}


// Id của dòng đầu tiên đang Suspended trong đơn - dùng cho nút "Gỡ khóa" (Admin gỡ tạm khóa thủ công,
// xem LiftSuspensionButton.tsx). Thường 1 đơn chỉ có 1 dòng nên trường hợp nhiều dòng Suspended cùng
// lúc là biên, chỉ gỡ dòng đầu tiên tìm thấy.
export function getFirstSuspendedItemId(items: OrderRequestItemDto[]): number | null {
  return items.find((item) => item.lifecycleStatus === "Suspended")?.id ?? null;
}


// Đợt 13, Phần 3 (C1) - đơn "New" (chưa liên hệ/chưa thanh toán) đứng yên quá lâu dễ bị Admin bỏ quên
// giữa hàng trăm đơn khác - badge cảnh báo thuần frontend (createdAt đã có sẵn trong DTO, không cần đổi
// backend). Ngưỡng NGẮN HƠN StaleOrderCancelAfterDays (mặc định 3 ngày, xem AppSettings.cs) có chủ đích
// - Admin cần thấy cảnh báo trước khi hệ thống tự huỷ đơn (C2), không phải cùng lúc.
export const STALE_ORDER_DAYS = 2;


export function isStaleNewOrder(status: string, createdAt: string): boolean {
  if (status !== "New") return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs >= STALE_ORDER_DAYS * 24 * 60 * 60 * 1000;
}



