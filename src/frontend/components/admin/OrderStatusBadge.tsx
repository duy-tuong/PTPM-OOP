import { ORDER_REQUEST_STATUS_LABELS } from "@/lib/types/enums";
import { cn } from "@/lib/utils";

// 5 màu cho đúng 5 trạng thái thật OrderRequestStatus (New/Contacted/Confirmed/Cancelled/Completed) -
// KHÔNG phải Active/Pending/Suspended (không khớp domain thật của hệ thống này). Giữ tinh thần
// xanh=trạng thái tốt/đỏ=trạng thái xấu. Tái dùng được ở trang /admin/order-requests (Phase 6.9).
const STATUS_STYLES: Record<string, string> = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-100 text-blue-800",
  Confirmed: "bg-indigo-100 text-indigo-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700",
      )}
    >
      {ORDER_REQUEST_STATUS_LABELS[status] ?? status}
    </span>
  );
}
