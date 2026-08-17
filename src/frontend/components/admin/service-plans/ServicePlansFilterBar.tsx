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
    <div className="flex flex-wrap gap-3">
      <Select
        value={currentCategorySlug ?? "all"}
        onValueChange={(value) => updateParam("categorySlug", value === "all" ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả danh mục</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentIsFeatured === "true" ? "featured" : "all"}
        onValueChange={(value) => updateParam("isFeatured", value === "featured" ? "true" : null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Nổi bật" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả gói</SelectItem>
          <SelectItem value="featured">Chỉ gói nổi bật</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
