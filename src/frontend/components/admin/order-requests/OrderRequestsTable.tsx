"use client";

import { useState } from "react";
import { Pencil, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { LifecycleStatusBadge } from "@/components/admin/LifecycleStatusBadge";
import { OrderStatusDialog } from "@/components/admin/order-requests/OrderStatusDialog";
import { LiftSuspensionButton } from "@/components/admin/order-requests/LiftSuspensionButton";
import { formatOrderProductSummary, getWorstLifecycleStatus, getFirstSuspendedItemId } from "@/lib/utils/orderItems";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminOrderRequestDto } from "@/lib/types/admin";

// Không có Create/Delete cho resource này - Dialog chỉ dùng để đổi trạng thái, mirror pattern
// Manager của Phase 6.7/6.8 nhưng rút gọn.
export function OrderRequestsTable({ orders }: { orders: AdminOrderRequestDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRequestDto | null>(null);

  function openStatusDialog(order: AdminOrderRequestDto) {
    setSelectedOrder(order);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminOrderRequestDto>[] = [
    {
      key: "orderCode",
      header: "Mã đơn",
      className: "font-mono",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.orderCode}
          {/* Fraud Review (Đợt 2, Phần 9) - KHÔNG chặn đơn, chỉ cảnh báo để Admin duyệt tay - tooltip
              native (title) hiện FlagReason, project chưa có sẵn component Tooltip riêng. */}
          {row.isFlaggedForReview && (
            <span title={row.flagReason ?? "Đơn bị gắn cờ nghi vấn"}>
              <TriangleAlert className="size-3.5 shrink-0 text-red-500" aria-label="Đơn nghi vấn" />
            </span>
          )}
        </div>
      ),
    },
    {
      key: "customer",
      header: "Khách hàng",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{row.customerName}</span>
          <span className="text-xs text-zinc-500">{row.customerEmail}</span>
        </div>
      ),
    },
    {
      key: "product",
      header: "Sản phẩm",
      cell: (row) => formatOrderProductSummary(row.items),
    },
    {
      key: "totalPrice",
      header: "Số tiền",
      className: "font-mono tabular-nums",
      cell: (row) => formatCurrency(row.totalPrice),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <OrderStatusBadge status={row.status} />
          <LifecycleStatusBadge status={getWorstLifecycleStatus(row.items)} />
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => {
        const suspendedItemId = getFirstSuspendedItemId(row.items);
        return (
          <div className="flex justify-end items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
            {suspendedItemId !== null && <LiftSuspensionButton itemId={suspendedItemId} />}
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-zinc-400 hover:text-zinc-900 transition-colors"
              aria-label={`Cập nhật trạng thái đơn ${row.orderCode}`}
              onClick={() => openStatusDialog(row)}
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={orders} emptyMessage="Chưa có đơn hàng nào." getRowKey={(row) => row.id} />
      <OrderStatusDialog open={dialogOpen} onOpenChange={setDialogOpen} order={selectedOrder} />
    </>
  );
}
