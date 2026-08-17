import { cn } from "@/lib/utils";

// Badge nhị phân IsActive dùng chung cho Category/Plan/Promotion - khác OrderStatusBadge (5 trạng
// thái riêng của OrderRequest, xem components/admin/OrderStatusBadge.tsx).
export function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-slate-300")} />
      <span className={cn("text-[13px] font-medium", isActive ? "text-slate-700" : "text-slate-500")}>
        {isActive ? "Đang hoạt động" : "Đã tắt"}
      </span>
    </div>
  );
}
