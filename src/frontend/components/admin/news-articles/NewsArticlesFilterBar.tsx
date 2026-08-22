"use client";

import { useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminNewsCategoryDto } from "@/lib/types/admin";

interface NewsArticlesFilterBarProps {
  categories: AdminNewsCategoryDto[];
  currentCategorySlug?: string;
  currentSearch?: string;
}

// Mirror ServicePlansFilterBar.tsx (Phase 6.7) - filter qua URL search params. Search dùng Enter để
// áp dụng (không debounce-on-type, tránh gọi lại Server Component quá nhiều lần).
export function NewsArticlesFilterBar({ categories, currentCategorySlug, currentSearch }: NewsArticlesFilterBarProps) {
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
          placeholder="Tìm theo tiêu đề... (Enter để tìm)"
          className="rounded-full bg-white pl-9 shadow-none ring-1 ring-zinc-950/5"
        />
      </div>

      <Select
        items={[
          { value: "all-categories", label: "Tất cả danh mục" },
          ...categories.map((category) => ({ value: category.slug, label: category.name })),
        ]}
        value={currentCategorySlug ?? "all-categories"}
        onValueChange={(value) => updateParam("categorySlug", value === "all-categories" ? null : value)}
      >
        <SelectTrigger className="w-[220px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Tất cả danh mục" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value="all-categories">Tất cả danh mục</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
