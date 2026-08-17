"use client";

import { useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// AuditLogQueryParams chỉ có duy nhất filter EntityName (string tự do, không phải enum) - dùng ô
// tìm kiếm text thường, không dựng <Select> liệt kê cứng tên entity (có thể mở rộng về sau).
export function AuditLogsFilterBar({ currentEntityName }: { currentEntityName?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(currentEntityName ?? "");

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const next = new URLSearchParams(searchParams.toString());
      if (value.trim()) next.set("entityName", value.trim());
      else next.delete("entityName");
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    }
  }

  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tìm theo tên đối tượng (vd OrderRequest)... Enter"
        className="rounded-full bg-white pl-9 shadow-none ring-1 ring-zinc-950/5"
      />
    </div>
  );
}
