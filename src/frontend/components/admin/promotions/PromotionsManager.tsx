"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PromotionStatusBadge } from "@/components/admin/promotions/PromotionStatusBadge";
import { PromotionDialog } from "@/components/admin/promotions/PromotionDialog";
import { PromotionsFilterBar } from "@/components/admin/promotions/PromotionsFilterBar";
import { deletePromotionAction } from "@/app/admin/promotions/actions";
import { DISCOUNT_TYPE_LABELS } from "@/lib/types/enums";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminPromotionDto, AdminServiceCategoryDto, AdminServicePlanDto } from "@/lib/types/admin";

interface PromotionsManagerProps {
  promotions: AdminPromotionDto[];
  categories: AdminServiceCategoryDto[];
  plans: AdminServicePlanDto[];
  currentSearch?: string;
}

// `promotions` là 1 TRANG (page.tsx đã phân trang qua getAdminPromotions) - Sửa chỉ prefill từ record
// đã có sẵn trong mảng của trang hiện tại, không fetch lại theo id.
export function PromotionsManager({ promotions, categories, plans, currentSearch }: PromotionsManagerProps) {
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
          <span className="font-mono text-sm font-medium text-zinc-900">{row.code}</span>
          <span className="text-xs text-zinc-500">{row.name}</span>
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
      key: "scope",
      header: "Phạm vi",
      cell: (row) => {
        if (row.scopes.length === 0) return <span className="text-zinc-400">-</span>;
        if (row.scopes.some((s) => s.scopeType === "All")) {
          return (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 ring-1 ring-inset ring-zinc-300/40">
              <div className="size-1.5 rounded-full bg-zinc-500" />
              <span className="text-[12px] font-medium text-zinc-700">Toàn bộ</span>
            </div>
          );
        }
        return (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 ring-1 ring-inset ring-blue-500/20">
            <div className="size-1.5 rounded-full bg-blue-500" />
            <span className="text-[12px] font-medium text-blue-700">
              {row.scopes.length} danh mục/gói
            </span>
          </div>
        );
      },
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
        <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            aria-label={`Sửa ${row.name}`}
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={() => deletePromotionAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Khuyến mãi</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Quản lý mã giảm giá áp dụng khi khách đặt dịch vụ.</p>
        </div>
        <Button
          className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800"
          onClick={openCreateDialog}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Thêm khuyến mãi
        </Button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <div className="border-b border-zinc-100 bg-zinc-50/30 p-4">
          <PromotionsFilterBar currentSearch={currentSearch} />
        </div>
        <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0">
          <DataTable
            columns={columns}
            data={promotions}
            emptyMessage="Chưa có chương trình khuyến mãi nào."
            getRowKey={(row) => row.id}
          />
        </div>
      </div>

      <PromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        promotion={editingPromotion}
        categories={categories}
        plans={plans}
      />
    </div>
  );
}
