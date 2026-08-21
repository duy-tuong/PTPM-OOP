import { ORDER_REQUEST_STATUS_LABELS } from "@/lib/types/enums";
import { cn } from "@/lib/utils";

// 5 màu cho đúng 5 trạng thái thật OrderRequestStatus (New/Contacted/Confirmed/Cancelled/Completed) -
// KHÔNG phải Active/Pending/Suspended (không khớp domain thật của hệ thống này). Giữ tinh thần
// xanh=trạng thái tốt/đỏ=trạng thái xấu. Dùng ở /admin/order-requests (Phase 6.9) và
// RecentOrdersTable.tsx (Dashboard, Phase 6.6). Style dot-pill khớp StatusBadge.tsx/PublishBadge.tsx.
const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  New: { dot: "bg-slate-400", text: "text-slate-600" },
  Contacted: { dot: "bg-blue-500", text: "text-blue-700" },
  Confirmed: { dot: "bg-indigo-500", text: "text-indigo-700" },
  Completed: { dot: "bg-emerald-500", text: "text-emerald-700" },
  Cancelled: { dot: "bg-red-500", text: "text-red-700" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { dot: "bg-zinc-400", text: "text-zinc-600" };

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full", style.dot)} />
      <span className={cn("text-[13px] font-medium", style.text)}>
        {ORDER_REQUEST_STATUS_LABELS[status] ?? status}
      </span>
    </div>
  );
}
