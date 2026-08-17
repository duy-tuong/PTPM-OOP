import { CONSULTATION_STATUS_LABELS } from "@/lib/types/enums";
import { cn } from "@/lib/utils";

// 4 màu cho ConsultationStatus (New/Contacted/Resolved/Closed) - Closed dùng zinc đậm hơn New (đã
// đóng, khác "chưa xử lý"). Mirror OrderStatusBadge.tsx (Phase 6.9).
const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  New: { dot: "bg-slate-400", text: "text-slate-600" },
  Contacted: { dot: "bg-blue-500", text: "text-blue-700" },
  Resolved: { dot: "bg-emerald-500", text: "text-emerald-700" },
  Closed: { dot: "bg-zinc-500", text: "text-zinc-700" },
};

export function ConsultationStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { dot: "bg-zinc-400", text: "text-zinc-600" };

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full", style.dot)} />
      <span className={cn("text-[13px] font-medium", style.text)}>
        {CONSULTATION_STATUS_LABELS[status] ?? status}
      </span>
    </div>
  );
}
