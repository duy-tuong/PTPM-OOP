"use client";

import { useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewsCommentsFilterBarProps {
  currentIsApproved?: string;
  currentSearch?: string;
}

const ALL_VALUE = "all";

// Mirror NewsArticlesFilterBar.tsx (Phase 6.8) - filter qua URL search params. Không có filter theo
// bài viết cụ thể (API hỗ trợ nhưng UI chỉ cần lọc theo trạng thái duyệt, tránh dựng thêm 1 Select
// chọn bài viết chỉ cho use-case hiếm).
export function NewsCommentsFilterBar({ currentIsApproved, currentSearch }: NewsCommentsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch ?? "");

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      updateParam("search", searchValue.trim() || null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Tìm theo nội dung, tên hoặc khách hàng... Enter"
          className="rounded-full bg-white pl-9 shadow-none ring-1 ring-zinc-950/5"
        />
      </div>

      <Select
        items={[
          { value: ALL_VALUE, label: "Tất cả trạng thái" },
          { value: "false", label: "Chờ duyệt" },
          { value: "true", label: "Đã duyệt" },
        ]}
        value={currentIsApproved ?? ALL_VALUE}
        onValueChange={(value) => updateParam("isApproved", value === ALL_VALUE ? null : value)}
      >
        <SelectTrigger className="w-[200px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Tất cả trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>Tất cả trạng thái</SelectItem>
          <SelectItem value="false">Chờ duyệt</SelectItem>
          <SelectItem value="true">Đã duyệt</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
