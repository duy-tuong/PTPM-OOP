import { cn } from "@/lib/utils";

// Badge nhị phân IsActive dùng chung cho Category/Plan/Promotion - khác OrderStatusBadge (5 trạng
// thái riêng của OrderRequest, xem components/admin/OrderStatusBadge.tsx).
export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600",
      )}
    >
      {isActive ? "Đang hoạt động" : "Đã tắt"}
    </span>
  );
}
