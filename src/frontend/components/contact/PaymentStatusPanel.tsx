"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderItemConfigSummary } from "@/components/account/OrderItemConfigSummary";
import { formatCurrency } from "@/lib/utils";
import { getOrderByCodePublic } from "@/lib/api/sales";
import { ORDER_ITEM_KIND_LABELS } from "@/lib/utils/orderItems";
import type { OrderLookupDto } from "@/lib/types/sales";

// Đơn còn ở 1 trong 3 trạng thái này = chưa thanh toán, còn cần hiện QR/nút PayOS + tiếp tục poll.
const BEFORE_PAID_STATUSES = new Set(["New", "Contacted", "Confirmed"]);
const POLL_INTERVAL_MS = 3000;

// Toàn bộ khối "mã đơn + trạng thái + tóm tắt + thanh toán" gộp vào 1 Client Component (thay vì chỉ mỗi
// phần QR) để badge trạng thái ở đầu card cùng cập nhật đồng bộ với phần thanh toán bên dưới khi poll -
// tách riêng 2 component sẽ phải poll trùng lặp hoặc badge bị đứng hình so với phần dưới.
export function PaymentStatusPanel({
  initialOrder,
  paymentQuery,
}: {
  initialOrder: OrderLookupDto;
  paymentQuery?: string;
}) {
  const [order, setOrder] = useState(initialOrder);
  const isBeforePaid = BEFORE_PAID_STATUSES.has(order.status);

  useEffect(() => {
    if (!isBeforePaid) return;

    let cancelled = false;
    async function pollOrderStatus() {
      try {
        const result = await getOrderByCodePublic(initialOrder.orderCode);
        if (!cancelled) {
          setOrder(result);
        }
      } catch {
        // Lỗi mạng tạm thời - bỏ qua, tự thử lại ở lần poll tiếp theo, không cần báo lỗi cho khách.
      }
    }

    const intervalId = setInterval(pollOrderStatus, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [isBeforePaid, initialOrder.orderCode]);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
          <p className="font-heading text-xl font-semibold text-foreground">{order.orderCode}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground">
                  {ORDER_ITEM_KIND_LABELS[item.itemKind] && (
                    <span className="mr-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-primary uppercase">
                      {ORDER_ITEM_KIND_LABELS[item.itemKind]}
                    </span>
                  )}
                  {item.productName} x{item.quantity}
                </span>
                <span className="font-medium text-foreground">{formatCurrency(item.lineTotal)}</span>
              </div>
              {item.itemKind === "PlanChange" && (
                <p className="pl-0 text-xs text-muted-foreground">
                  Số tiền trên là phần phụ thu do đổi gói (không phải giá đầy đủ của {item.productName}).
                </p>
              )}
              <OrderItemConfigSummary
                osImageName={item.osImageName}
                chosenVcpu={item.chosenVcpu}
                chosenRamMb={item.chosenRamMb}
                chosenDiskGb={item.chosenDiskGb}
                addons={item.addons}
              />
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Tổng cộng</span>
          <span className="font-heading text-lg font-semibold text-primary">
            {formatCurrency(order.totalPrice)}
          </span>
        </div>
      </div>

      {isBeforePaid ? (
        <>
          {paymentQuery === "success" && (
            <div className="rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-sm text-foreground">
              PayOS đã ghi nhận yêu cầu thanh toán, đang chờ ngân hàng xác nhận - trang này sẽ tự cập nhật
              ngay khi hoàn tất, không cần bấm F5.
            </div>
          )}
          {paymentQuery === "cancelled" && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 px-4 py-3 text-sm text-foreground">
              Bạn đã huỷ giao dịch trên PayOS. Có thể quét lại mã QR hoặc bấm nút bên dưới để thử lại.
            </div>
          )}

          <div className="flex flex-col items-center gap-4 rounded-xl border border-primary/40 bg-primary/5 p-6 text-center">
            <h2 className="font-heading text-base font-semibold text-foreground">Quét mã để thanh toán</h2>
            {order.payOsQrCodeImage && (
              // eslint-disable-next-line @next/next/no-img-element -- data URI (ảnh QR sinh động), không phải asset tĩnh next/image tối ưu được
              <img
                src={order.payOsQrCodeImage}
                alt="Mã QR thanh toán PayOS"
                width={220}
                height={220}
                className="size-[220px] rounded-lg border border-border bg-white p-2"
              />
            )}
            <p className="max-w-sm text-sm text-muted-foreground">
              Mở app ngân hàng bất kỳ và quét mã QR để chuyển khoản đúng số tiền - hệ thống tự động ghi
              nhận thanh toán, không cần chờ nhân viên xác nhận.
            </p>
            {order.payOsCheckoutUrl && (
              <Button
                nativeButton={false}
                className="h-11 w-full max-w-xs rounded-full text-base font-semibold"
                render={
                  <a href={order.payOsCheckoutUrl} target="_blank" rel="noopener noreferrer">
                    Mở trang thanh toán PayOS
                  </a>
                }
              />
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Đang chờ thanh toán - trang tự cập nhật khi PayOS xác nhận
            </div>
          </div>
        </>
      ) : order.status === "Cancelled" ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-foreground">
          Đơn hàng này đã bị huỷ, không cần thanh toán nữa.
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-4 text-sm text-foreground">
          Đã ghi nhận thanh toán thành công. Cảm ơn bạn - Cloudverse đang xử lý các bước tiếp theo, xem chi
          tiết bàn giao dịch vụ tại mục &quot;Đơn hàng của tôi&quot; sau khi đăng nhập.
        </div>
      )}
    </div>
  );
}
