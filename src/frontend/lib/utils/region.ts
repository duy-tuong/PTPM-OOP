// Region.countryCode ("VN", "SG"...) -> emoji cờ quốc gia. Chỉ là transform hiển thị của field có sẵn
// (RegionDto.countryCode), không phải dữ liệu nghiệp vụ mới - dùng chung giữa PricingMatrixTabs.tsx và
// RegionAvailabilityStrip.tsx.
export function countryFlag(countryCode: string): string {
  return countryCode
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}
