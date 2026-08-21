import { AFFILIATE_APPLICATION_STATUS_LABELS } from "@/lib/types/enums";
import { cn } from "@/lib/utils";

// 3 màu cho AffiliateApplicationStatus (Pending/Approved/Rejected). Mirror OrderStatusBadge.tsx
// (Phase 6.9).
const STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  Pending: { dot: "bg-amber-500", text: "text-amber-700" },
  Approved: { dot: "bg-emerald-500", text: "text-emerald-700" },
  Rejected: { dot: "bg-red-500", text: "text-red-700" },
};

export function AffiliateStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { dot: "bg-zinc-400", text: "text-zinc-600" };

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full", style.dot)} />
      <span className={cn("text-[13px] font-medium", style.text)}>
        {AFFILIATE_APPLICATION_STATUS_LABELS[status] ?? status}
      </span>
    </div>
  );
}
