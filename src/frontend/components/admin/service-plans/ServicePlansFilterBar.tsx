"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminServiceCategoryDto } from "@/lib/types/admin";

interface ServicePlansFilterBarProps {
  categories: AdminServiceCategoryDto[];
  currentCategorySlug?: string;
  currentIsFeatured?: string;
}

// Điều khiển filter qua URL search params (giống quy ước Pagination đã chốt ở Design System) - giữ
// state ở URL để back-button/refresh hoạt động đúng, không dùng client state riêng.
export function ServicePlansFilterBar({
  categories,
  currentCategorySlug,
  currentIsFeatured,
}: ServicePlansFilterBarProps) {
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
    <div className="flex flex-wrap items-center gap-4">
      <div className="text-sm font-medium text-zinc-500 mr-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Bộ lọc:
      </div>
      <Select
        value={currentCategorySlug ?? "all-categories"}
        onValueChange={(value) => updateParam("categorySlug", value === "all-categories" ? null : value)}
      >
        <SelectTrigger className="w-[220px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Tất cả danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-categories">Tất cả danh mục</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentIsFeatured === "true" ? "featured" : "all-plans"}
        onValueChange={(value) => updateParam("isFeatured", value === "featured" ? "true" : null)}
      >
        <SelectTrigger className="w-[180px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Tất cả gói" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-plans">Tất cả gói</SelectItem>
          <SelectItem value="featured">Chỉ gói nổi bật</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
