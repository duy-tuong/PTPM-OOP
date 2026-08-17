"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PromotionStatusBadge } from "@/components/admin/promotions/PromotionStatusBadge";
import { PromotionDialog } from "@/components/admin/promotions/PromotionDialog";
import { deletePromotionAction } from "@/app/admin/promotions/actions";
import { DISCOUNT_TYPE_LABELS } from "@/lib/types/enums";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminPromotionDto } from "@/lib/types/admin";

// unpaged-list-in-Dialog: getAdminPromotions trả về danh sách phẳng (không phân trang) - Sửa chỉ
// prefill từ record đã có sẵn trong mảng, không fetch lại theo id.
export function PromotionsManager({ promotions }: { promotions: AdminPromotionDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<AdminPromotionDto | null>(null);

  function openCreateDialog() {
    setEditingPromotion(null);
    setDialogOpen(true);
  }

  function openEditDialog(promotion: AdminPromotionDto) {
    setEditingPromotion(promotion);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminPromotionDto>[] = [
    {
      key: "code",
      header: "Khuyến mãi",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-medium text-gray-900">{row.code}</span>
          <span className="text-xs text-gray-500">{row.name}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Loại giảm giá",
      cell: (row) => DISCOUNT_TYPE_LABELS[row.discountType] ?? row.discountType,
    },
    {
      key: "value",
      header: "Giá trị",
      className: "font-mono tabular-nums",
      cell: (row) => (row.discountType === "Percentage" ? `${row.discountValue}%` : formatCurrency(row.discountValue)),
    },
    {
      key: "period",
      header: "Thời gian",
      cell: (row) => `${formatDate(row.startDate)} - ${formatDate(row.endDate)}`,
    },
    {
      key: "usage",
      header: "Đã dùng",
      className: "font-mono tabular-nums",
      cell: (row) => `${row.usageCount}/${row.usageLimit ?? "∞"}`,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => <PromotionStatusBadge isActive={row.isActive} startDate={row.startDate} endDate={row.endDate} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Sửa ${row.name}`} onClick={() => openEditDialog(row)}>
            <Pencil className="size-4" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={() => deletePromotionAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" data-icon="inline-start" />
          Thêm khuyến mãi
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={promotions}
        emptyMessage="Chưa có chương trình khuyến mãi nào."
        getRowKey={(row) => row.id}
      />

      <PromotionDialog open={dialogOpen} onOpenChange={setDialogOpen} promotion={editingPromotion} />
    </div>
  );
}
