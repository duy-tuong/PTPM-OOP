"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_REQUEST_STATUS_LABELS } from "@/lib/types/enums";

const ALL_STATUS_VALUE = "all-status";

// URL lưu tên enum ("New"/"Contacted"/...) thay vì số - đọc dễ hơn, khớp cách backend trả về status
// dạng string. page.tsx tự map tên -> số khi build query gọi API.
export function OrderRequestsFilterBar({ currentStatus }: { currentStatus?: string }) {
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
  );
}
