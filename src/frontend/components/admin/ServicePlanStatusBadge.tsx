import { SERVICE_PLAN_STATUS_LABELS } from "@/lib/types/enums";
import { cn } from "@/lib/utils";

// 5 trạng thái vòng đời ServicePlan (Draft/Active/OutOfStock/Archived/Deprecated) - khác StatusBadge.tsx
// (nhị phân IsActive, vẫn dùng cho Category/Promotion). Style dot-pill khớp OrderStatusBadge.tsx.
const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  Draft: { dot: "bg-slate-400", text: "text-slate-600" },
  Active: { dot: "bg-emerald-500", text: "text-emerald-700" },
  OutOfStock: { dot: "bg-amber-500", text: "text-amber-700" },
  Deprecated: { dot: "bg-orange-500", text: "text-orange-700" },
  Archived: { dot: "bg-red-500", text: "text-red-700" },
};

export function ServicePlanStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { dot: "bg-zinc-400", text: "text-zinc-600" };

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full", style.dot)} />
      <span className={cn("text-[13px] font-medium", style.text)}>
        {SERVICE_PLAN_STATUS_LABELS[status] ?? status}
      </span>
    </div>
  );
}
