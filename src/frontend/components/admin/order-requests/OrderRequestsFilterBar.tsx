"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ORDER_REQUEST_STATUS_LABELS } from "@/lib/types/enums";

const ALL_STATUS_VALUE = "all-status";

// URL lưu tên enum ("New"/"Contacted"/...) thay vì số - đọc dễ hơn, khớp cách backend trả về status
// dạng string. page.tsx tự map tên -> số khi build query gọi API.
export function OrderRequestsFilterBar({ currentStatus, flaggedOnly }: { currentStatus?: string; flaggedOnly?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        items={[
          { value: ALL_STATUS_VALUE, label: "Tất cả trạng thái" },
          ...Object.entries(ORDER_REQUEST_STATUS_LABELS).map(([key, label]) => ({ value: key, label })),
        ]}
        value={currentStatus ?? ALL_STATUS_VALUE}
        onValueChange={(value) => updateParam("status", value === ALL_STATUS_VALUE ? null : value)}
      >
        <SelectTrigger className="w-[200px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Tất cả trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_STATUS_VALUE}>Tất cả trạng thái</SelectItem>
          {Object.entries(ORDER_REQUEST_STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Fraud Review (Đợt 2, Phần 9) - toggle dạng pill (không dùng Checkbox, project chưa có sẵn
          component đó) thay vì Select vì chỉ có đúng 1 điều kiện bật/tắt. */}
      <button
        type="button"
        onClick={() => updateParam("flaggedOnly", flaggedOnly ? null : "true")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ring-1 transition-colors",
          flaggedOnly
            ? "bg-amber-50 text-amber-700 ring-amber-600/20 hover:bg-amber-100"
            : "bg-white text-zinc-600 ring-zinc-950/5 hover:bg-zinc-50",
        )}
      >
        <TriangleAlert className="size-3.5" />
        Chỉ đơn nghi vấn
      </button>
    </div>
  );
}
