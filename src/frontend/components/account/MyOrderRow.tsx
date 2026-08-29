"use client";


import { useState } from "react";
import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderItemConfigSummary } from "@/components/account/OrderItemConfigSummary";
import { ProvisioningDetailsCard } from "@/components/account/ProvisioningDetailsCard";
import { CancelOrderDialog } from "@/components/account/CancelOrderDialog";
import { formatOrderItemLabel, formatOrderProductSummary } from "@/lib/utils/orderItems";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { MyOrderRequestDto } from "@/lib/types/sales";


// Đợt 13, Phần 1 (A1/A2) - đúng 3 trạng thái backend còn cho thanh toán/tự huỷ (IsBeforePaid ở
// OrderRequestService.cs), giữ đồng bộ 2 phía để nút không hiện ra rồi bấm vào mới báo lỗi.
const PAYABLE_STATUSES = new Set(["New", "Contacted", "Confirmed"]);


// Tách khỏi don-hang/page.tsx (Server Component) thành Client Component riêng chỉ để giữ state
// expanded cục bộ - không fetch thêm gì, toàn bộ dữ liệu (kể cả thông tin bàn giao Tier 3) đã có sẵn
// trong prop `order` từ server. Mở rộng để liệt kê từng dòng sản phẩm + thông tin bàn giao (nếu có).
export function MyOrderRow({ order }: { order: MyOrderRequestDto }) {
  const [expanded, setExpanded] = useState(false);
  const isPayable = PAYABLE_STATUSES.has(order.status);


  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="px-4 py-3 font-medium text-foreground">{order.orderCode}</td>
        <td className="px-4 py-3 text-muted-foreground">{formatOrderProductSummary(order.items)}</td>
        <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(order.totalPrice)}</td>
        <td className="px-4 py-3">
          <OrderStatusBadge status={order.status} />
        </td>
        <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            {isPayable && (
              <>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href={`/thanh-toan/${order.orderCode}`}>Thanh toán ngay</Link>}
                />
                <CancelOrderDialog order={order} />
              </>
            )}
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              aria-label={expanded ? "Thu gọn chi tiết đơn hàng" : "Xem chi tiết đơn hàng"}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <CaretDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
            </button>
          </div>
        </td>
      </tr>


      {expanded && (
        <tr className="border-b border-border bg-muted/30 last:border-0">
          <td colSpan={6} className="px-4 py-4">
            <ul className="flex flex-col gap-3">
              {order.items.map((item) => (
                <li key={item.id} className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground">{formatOrderItemLabel(item)}</span>
                    <span className="text-muted-foreground">{formatCurrency(item.lineTotal)}</span>
                  </div>


                  <div className="mt-1 flex flex-col gap-0.5">
                    {item.hostname && <p className="text-xs text-muted-foreground">Hostname: {item.hostname}</p>}
                    {item.tags && <p className="text-xs text-muted-foreground">Tags: {item.tags}</p>}
                    <OrderItemConfigSummary
                      osImageName={item.osImageName}
                      chosenVcpu={item.chosenVcpu}
                      chosenRamMb={item.chosenRamMb}
                      chosenDiskGb={item.chosenDiskGb}
                      addons={item.addons}
                    />
                  </div>


                  <ProvisioningDetailsCard
                    provisionedIpAddress={item.provisionedIpAddress}
                    provisionedRootPassword={item.provisionedRootPassword}
                    provisionedNameservers={item.provisionedNameservers}
                  />
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}



