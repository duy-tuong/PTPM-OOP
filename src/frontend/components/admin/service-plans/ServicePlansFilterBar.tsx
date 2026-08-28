"use client";

import { useState, type KeyboardEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServicePlanStatus, SERVICE_PLAN_STATUS_LABELS } from "@/lib/types/enums";
import type { AdminServiceCategoryDto } from "@/lib/types/admin";
import type { RegionDto } from "@/lib/types/catalog";

interface ServicePlansFilterBarProps {
  categories: AdminServiceCategoryDto[];
  regions: RegionDto[];
  currentCategorySlug?: string;
  currentIsFeatured?: string;
  currentStatus?: string;
  currentRegionId?: string;
  currentSearch?: string;
}

const STATUS_FILTER_OPTIONS = Object.entries(ServicePlanStatus)
  .filter(([, value]) => typeof value === "number")
  .map(([key, value]) => ({ value: String(value), label: SERVICE_PLAN_STATUS_LABELS[key] ?? key }));

// Điều khiển filter qua URL search params (giống quy ước Pagination đã chốt ở Design System) - giữ
// state ở URL để back-button/refresh hoạt động đúng, không dùng client state riêng.
export function ServicePlansFilterBar({
  categories,
  regions,
  currentCategorySlug,
  currentIsFeatured,
  currentStatus,
  currentRegionId,
  currentSearch,
}: ServicePlansFilterBarProps) {
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
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Tìm theo tên, slug hoặc SKU... Enter"
          className="rounded-full bg-white pl-9 shadow-none ring-1 ring-zinc-950/5"
        />
      </div>

      <div className="text-sm font-medium text-zinc-500 mr-2 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Bộ lọc:
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

      <Select
        items={[
          { value: "all-plans", label: "Tất cả gói" },
          { value: "featured", label: "Chỉ gói nổi bật" },
        ]}
        value={currentIsFeatured === "true" ? "featured" : "all-plans"}
        onValueChange={(value) => updateParam("isFeatured", value === "featured" ? "true" : null)}
      >
        <SelectTrigger className="w-[180px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Tất cả gói" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value="all-plans">Tất cả gói</SelectItem>
          <SelectItem value="featured">Chỉ gói nổi bật</SelectItem>
        </SelectContent>
      </Select>

      <Select
        items={[{ value: "all-status", label: "Mọi trạng thái" }, ...STATUS_FILTER_OPTIONS]}
        value={currentStatus ?? "all-status"}
        onValueChange={(value) => updateParam("status", value === "all-status" ? null : value)}
      >
        <SelectTrigger className="w-[180px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Mọi trạng thái" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value="all-status">Mọi trạng thái</SelectItem>
          {STATUS_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={[
          { value: "all-regions", label: "Mọi khu vực" },
          ...regions.map((region) => ({ value: region.id, label: `${region.name} (${region.city})` })),
        ]}
        value={currentRegionId ?? "all-regions"}
        onValueChange={(value) => updateParam("regionId", value === "all-regions" ? null : value)}
      >
        <SelectTrigger className="w-[200px] rounded-full bg-white border-zinc-200/60 shadow-none ring-1 ring-zinc-950/5 hover:bg-zinc-50">
          <SelectValue placeholder="Mọi khu vực" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value="all-regions">Mọi khu vực</SelectItem>
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              {region.name} ({region.city})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
