"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { OrderStatusDialog } from "@/components/admin/order-requests/OrderStatusDialog";
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
      cell: (row) => row.orderCode,
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
      cell: (row) => row.servicePlanName ?? (row.domainName && row.tldName ? `${row.domainName}${row.tldName}` : "-"),
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
      cell: (row) => <OrderStatusBadge status={row.status} />,
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
      cell: (row) => (
        <div className="flex justify-end opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
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
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={orders} emptyMessage="Chưa có đơn hàng nào." getRowKey={(row) => row.id} />
      <OrderStatusDialog open={dialogOpen} onOpenChange={setDialogOpen} order={selectedOrder} />
    </>
  );
}
