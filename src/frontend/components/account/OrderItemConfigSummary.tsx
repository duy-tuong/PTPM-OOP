import { formatCurrency } from "@/lib/utils";

interface ConfigSummaryAddon {
  addonId: number;
  addonName: string;
  quantity: number;
  lineTotal: number;
}

export interface OrderItemConfigSummaryProps {
  osImageName?: string | null;
  chosenVcpu?: number | null;
  chosenRamMb?: number | null;
  chosenDiskGb?: number | null;
  addons: ConfigSummaryAddon[];
}

// "Cấu hình đã mua" của 1 dòng sản phẩm (OS + cấu hình vCPU/RAM/Disk gói Custom + Add-ons kèm giá) -
// dùng chung cho PaymentStatusPanel (khách vãng lai, /thanh-toan), MyOrderRow/MyServiceRow (khách đã
// đăng nhập, /khach-hang/don-hang và /khach-hang/dich-vu) và OrderStatusDialog (Admin) - Đợt 10, Phần
// 4-5. Tránh lặp lại logic này ở 4 nơi, đảm bảo Khách hàng/Admin luôn thấy cùng 1 dữ liệu theo cùng 1
// cách trình bày. Nhận vào shape tối thiểu (không phải nguyên DTO) để dùng được với cả OrderLookupItemDto/
// OrderRequestItemDto/MyServiceItemDto vốn không hoàn toàn giống nhau.
export function OrderItemConfigSummary({
  osImageName,
  chosenVcpu,
  chosenRamMb,
  chosenDiskGb,
  addons,
}: OrderItemConfigSummaryProps) {
  const hasCustomConfig = chosenVcpu != null && chosenRamMb != null && chosenDiskGb != null;
  if (!osImageName && !hasCustomConfig && addons.length === 0) {
    return null;
  }

  return (
    <>
      {osImageName && (
        <p className="text-xs text-muted-foreground">
          Hệ điều hành: <span className="text-foreground">{osImageName}</span>
        </p>
      )}
      {hasCustomConfig && (
        <p className="text-xs text-muted-foreground">
          {chosenVcpu} vCPU - {(chosenRamMb / 1024).toFixed(chosenRamMb % 1024 === 0 ? 0 : 1)} GB RAM - {chosenDiskGb} GB Disk
        </p>
      )}
      {addons.map((addon) => (
        <div key={addon.addonId} className="flex items-center justify-between gap-3 pl-4 text-xs text-muted-foreground">
          <span>
            + {addon.addonName} x{addon.quantity}
          </span>
          <span>{formatCurrency(addon.lineTotal)}</span>
        </div>
      ))}
    </>
  );
}
