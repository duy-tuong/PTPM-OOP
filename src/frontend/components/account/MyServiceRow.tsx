"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { LifecycleStatusBadge } from "@/components/admin/LifecycleStatusBadge";
import { RenewServiceDialog } from "@/components/account/RenewServiceDialog";
import { PlanChangeDialog } from "@/components/account/PlanChangeDialog";
import { OrderItemConfigSummary } from "@/components/account/OrderItemConfigSummary";
import { ProvisioningDetailsCard } from "@/components/account/ProvisioningDetailsCard";
import { cn, formatDate } from "@/lib/utils";
import type { MyServiceItemDto } from "@/lib/types/sales";

function formatServiceName(item: MyServiceItemDto): string {
  if (item.servicePlanName) return item.servicePlanName;
  if (item.domainName && item.tldName) return `${item.domainName}${item.tldName}`;
  return "Dịch vụ";
}

// Tách khỏi page.tsx (Server Component) thành Client Component riêng chỉ để giữ state expanded cục bộ -
// mirror chính xác MyOrderRow.tsx (không fetch thêm gì, toàn bộ dữ liệu đã có sẵn trong prop `item`).
// Đợt 10, Phần 4: trước đây trang "Dịch vụ đang chạy" hoàn toàn không cho xem lại OS/Hostname/Tags/cấu
// hình Custom (vCPU/RAM/Disk)/Add-ons đã mua, và ĐẶC BIỆT không hiện mật khẩu root dù dữ liệu đã có sẵn
// trong response - đây là nơi khách có lý do quay lại lâu dài nhất để tra cứu, nên bổ sung đầy đủ.
export function MyServiceRow({ item }: { item: MyServiceItemDto }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails =
    !!item.hostname ||
    !!item.tags ||
    !!item.osImageName ||
    item.chosenVcpu != null ||
    item.addons.length > 0 ||
    !!item.provisionedIpAddress ||
    !!item.provisionedNameservers;

  return (
    <>
      <tr className="group transition-colors hover:bg-muted/50">
        <td className="px-6 py-4 font-medium text-foreground">{formatServiceName(item)}</td>
        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{item.orderCode}</td>
        <td className="px-6 py-4">
          <OrderStatusBadge status={item.orderStatus} />
        </td>
        <td className="px-6 py-4 text-muted-foreground">{item.expiresAt ? formatDate(item.expiresAt) : "-"}</td>
        <td className="px-6 py-4">
          <LifecycleStatusBadge status={item.lifecycleStatus} />
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end items-center gap-1">
            {item.lifecycleStatus !== "Terminated" && (
              <>
                {item.expiresAt && item.servicePlanId && item.servicePlanPackageType === "Fixed" && (
                  <PlanChangeDialog item={item} />
                )}
                {item.expiresAt && <RenewServiceDialog item={item} />}
              </>
            )}
            {hasDetails && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                aria-expanded={expanded}
                aria-label={expanded ? "Thu gọn chi tiết dịch vụ" : "Xem chi tiết dịch vụ"}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <CaretDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
              </button>
            )}
          </div>
        </td>
      </tr>

      {expanded && hasDetails && (
        <tr className="bg-muted/30">
          <td colSpan={6} className="px-6 py-4">
            <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-background px-4 py-3">
              {item.hostname && <p className="text-xs text-muted-foreground">Hostname: {item.hostname}</p>}
              {item.tags && <p className="text-xs text-muted-foreground">Tags: {item.tags}</p>}
              <OrderItemConfigSummary
                osImageName={item.osImageName}
                chosenVcpu={item.chosenVcpu}
                chosenRamMb={item.chosenRamMb}
                chosenDiskGb={item.chosenDiskGb}
                addons={item.addons}
              />
              <ProvisioningDetailsCard
                provisionedIpAddress={item.provisionedIpAddress}
                provisionedRootPassword={item.provisionedRootPassword}
                provisionedNameservers={item.provisionedNameservers}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
