import { LIFECYCLE_STATUS_LABELS } from "@/lib/utils/orderItems";
import { cn } from "@/lib/utils";

// Dunning Automation (Đợt 2, Phần 8) - chỉ hiện khi dịch vụ ở 1 trong 3 trạng thái BẤT THƯỜNG
// (Overdue/Suspended/Terminated); "Active" (bình thường, đa số trường hợp) không render gì - tránh rợp
// mắt badge trên mọi dòng, mirror OrderStatusBadge.tsx style dot-pill nhưng tông màu cảnh báo.
const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  Overdue: { dot: "bg-amber-500", text: "text-amber-700" },
  Suspended: { dot: "bg-orange-500", text: "text-orange-700" },
  Terminated: { dot: "bg-red-500", text: "text-red-700" },
};

export function LifecycleStatusBadge({ status }: { status?: string | null }) {
  if (!status || status === "Active") return null;
  const style = STATUS_STYLES[status] ?? { dot: "bg-zinc-400", text: "text-zinc-600" };

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full", style.dot)} />
      <span className={cn("text-[13px] font-medium", style.text)}>
        {LIFECYCLE_STATUS_LABELS[status] ?? status}
      </span>
    </div>
  );
}
