"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RegionDto } from "@/lib/types/catalog";

// Lọc bảng giá theo Region (trang trí, xem Region.cs) - điều khiển qua URL search param
// (?regionId=...), cùng quy ước với ServicePlansFilterBar.tsx bên Admin, để back-button/refresh/chia
// sẻ link hoạt động đúng.
export function RegionFilterBar({ regions, currentRegionId }: { regions: RegionDto[]; currentRegionId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value && value !== "all-regions") next.set("regionId", value);
    else next.delete("regionId");
    router.push(`${pathname}?${next.toString()}#pricing`, { scroll: false });
  }

  return (
    <Select
      items={[
        { value: "all-regions", label: "Mọi khu vực" },
        ...regions.map((region) => ({ value: region.id, label: `📍 ${region.name} (${region.city})` })),
      ]}
      value={currentRegionId ?? "all-regions"}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[240px] rounded-full">
        <SelectValue placeholder="Mọi khu vực" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectItem value="all-regions">Mọi khu vực</SelectItem>
        {regions.map((region) => (
          <SelectItem key={region.id} value={region.id}>
            📍 {region.name} ({region.city})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
