"use client";

import { useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mirror PromotionsFilterBar.tsx - chỉ có đúng 1 ô tìm kiếm tự do.
export function ServiceCategoriesFilterBar({ currentSearch }: { currentSearch?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(currentSearch ?? "");

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      const next = new URLSearchParams(searchParams.toString());
      if (value.trim()) next.set("search", value.trim());
      else next.delete("search");
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
        placeholder="Tìm theo tên hoặc slug... Enter"
        className="rounded-full bg-white pl-9 shadow-none ring-1 ring-zinc-950/5"
      />
    </div>
  );
}
