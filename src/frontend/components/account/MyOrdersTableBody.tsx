"use client";

import { useEffect, useState } from "react";
import { MyOrderRow } from "@/components/account/MyOrderRow";
import type { MyOrderRequestDto } from "@/lib/types/sales";
import type { PagedResult } from "@/lib/types/common";

const POLL_INTERVAL_MS = 5000;
// Đơn ở 1 trong 2 trạng thái này không còn đổi thêm nữa - dừng poll khi TOÀN BỘ đơn trên trang hiện
// tại đều đã chốt, tránh gọi API vô ích cho trang chỉ toàn đơn cũ đã Completed/Cancelled từ lâu.
const FINAL_STATUSES = new Set(["Completed", "Cancelled"]);

// Tự làm mới trang "Đơn hàng của tôi" - mirror đúng pattern polling đã có ở PaymentStatusPanel.tsx
// (trang tra cứu đơn công khai), áp dụng cho danh sách nhiều đơn thay vì 1 đơn. Nơi gọi (don-hang/
// page.tsx) PHẢI truyền key={pageNumber} - khi khách đổi trang qua Pagination, `initialItems` đổi
// nhưng component không tự unmount (cùng vị trí trong JSX); dùng key để buộc remount + reset state về
// dữ liệu trang mới, thay vì setState trong effect (tránh cascading render, xem
// https://react.dev/learn/you-might-not-need-an-effect - cùng lý do đã áp dụng ở
// CustomPlanConfiguratorCard.tsx).
export function MyOrdersTableBody({
  initialItems,
  pageNumber,
  pageSize,
}: {
  initialItems: MyOrderRequestDto[];
  pageNumber: number;
  pageSize: number;
}) {
  const [items, setItems] = useState(initialItems);
  const allFinal = items.length > 0 && items.every((order) => FINAL_STATUSES.has(order.status));

  useEffect(() => {
    if (allFinal) return;

    let cancelled = false;
    async function pollOrders() {
      try {
        const res = await fetch(`/api/order-requests/mine?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        if (!res.ok) return;
        const result = (await res.json()) as PagedResult<MyOrderRequestDto>;
        if (!cancelled) setItems(result.items);
      } catch {
        // Lỗi mạng tạm thời - bỏ qua, tự thử lại ở lần poll tiếp theo.
      }
    }

    const intervalId = setInterval(pollOrders, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [allFinal, pageNumber, pageSize]);

  return (
    <tbody className="divide-y divide-border">
      {items.map((order) => (
        <MyOrderRow key={order.id} order={order} />
      ))}
    </tbody>
  );
}
