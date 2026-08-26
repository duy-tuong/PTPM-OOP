import { countryFlag } from "@/lib/utils/region";
import type { RegionDto } from "@/lib/types/catalog";

// Dải hiển thị nhanh các khu vực triển khai thật (RegionDto{name,city,countryCode}) ngay dưới Hero -
// KHÔNG dựng thành 1 "Region section" marketing lớn vì Region chỉ thuần trang trí (không có
// latency/uptime/datacenter-count thật để lấp đầy 1 section riêng, xem Region.cs) - dựng ra sẽ trông
// trống/giả. Ẩn hẳn nếu backend chưa có region nào.
export function RegionAvailabilityStrip({ regions }: { regions: RegionDto[] }) {
  if (regions.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 px-4 pb-8 sm:px-6 lg:px-8">
      {regions.map((region) => (
        <span
          key={region.id}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <span aria-hidden>{countryFlag(region.countryCode)}</span>
          {region.name} · {region.city}
        </span>
      ))}
    </div>
  );
}
