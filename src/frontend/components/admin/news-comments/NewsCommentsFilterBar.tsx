"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewsCommentsFilterBarProps {
  currentIsApproved?: string;
}

const ALL_VALUE = "all";

// Mirror NewsArticlesFilterBar.tsx (Phase 6.8) - filter qua URL search params. Không có filter theo
// bài viết cụ thể (API hỗ trợ nhưng UI chỉ cần lọc theo trạng thái duyệt, tránh dựng thêm 1 Select
// chọn bài viết chỉ cho use-case hiếm).
export function NewsCommentsFilterBar({ currentIsApproved }: NewsCommentsFilterBarProps) {
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
