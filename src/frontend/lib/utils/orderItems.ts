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

// Tóm tắt 1 dòng cho các danh sách chật chỗ (bảng Admin) - tên item đầu tiên, kèm "+N khác" nếu đơn
// có nhiều hơn 1 dòng. Nơi có đủ chỗ hơn (modal OrderStatusDialog) nên liệt kê từng item riêng bằng
// formatOrderItemLabel thay vì gọi hàm này.
export function formatOrderProductSummary(items: OrderRequestItemDto[]): string {
  if (items.length === 0) return "-";
  const first = formatOrderItemLabel(items[0]);
  return items.length > 1 ? `${first} +${items.length - 1} khác` : first;
}
