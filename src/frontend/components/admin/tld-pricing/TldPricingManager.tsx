"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { TldPricingDialog } from "@/components/admin/tld-pricing/TldPricingDialog";
import { deleteTldPricingAction } from "@/app/admin/tld-pricing/actions";
import { formatCurrency } from "@/lib/utils";
import type { AdminServiceCategoryDto, AdminTldPricingDto } from "@/lib/types/admin";

interface TldPricingManagerProps {
  tldPricing: AdminTldPricingDto[];
  categories: AdminServiceCategoryDto[];
}

// `tldPricing` là 1 TRANG (page.tsx đã phân trang qua getAdminTldPricing) - Sửa chỉ prefill từ
// record đã có sẵn trong mảng của trang hiện tại, không fetch lại theo id. ServiceCategoryId chỉ
// lưu id (không kèm tên, khớp AdminServicePlanDto.categoryId) - map tên qua categories đã fetch
// song song ở page.tsx.
export function TldPricingManager({ tldPricing, categories }: TldPricingManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminTldPricingDto | null>(null);

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  function openCreateDialog() {
    setEditingItem(null);
    setDialogOpen(true);
  }

  function openEditDialog(item: AdminTldPricingDto) {
    setEditingItem(item);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminTldPricingDto>[] = [
    {
      key: "tld",
      header: "Tên miền",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-mono font-medium text-zinc-900">{row.tld}</span>
          <span className="text-xs text-zinc-500">
            {row.serviceCategoryId ? (categoryNameById.get(row.serviceCategoryId) ?? "-") : "Không thuộc danh mục"}
          </span>
        </div>
      ),
    },
    {
      key: "registerPrice",
      header: "Giá đăng ký",
      className: "font-mono tabular-nums",
      cell: (row) => formatCurrency(row.registerPrice),
    },
    {
      key: "renewPrice",
      header: "Giá gia hạn",
      className: "font-mono tabular-nums",
      cell: (row) => formatCurrency(row.renewPrice),
    },
    {
      key: "transferPrice",
      header: "Giá chuyển đổi",
      className: "font-mono tabular-nums",
      cell: (row) => formatCurrency(row.transferPrice),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => <StatusBadge isActive={row.isActive} />,
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
            aria-label={`Sửa ${row.tld}`}
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.tld} onConfirm={() => deleteTldPricingAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Bảng giá tên miền</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Quản lý giá đăng ký/gia hạn/chuyển đổi cho từng đuôi tên miền.</p>
        </div>
        <Button
          className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800"
          onClick={openCreateDialog}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Thêm tên miền
        </Button>
      </div>

      <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <DataTable
          columns={columns}
          data={tldPricing}
          emptyMessage="Chưa có bảng giá tên miền nào."
          getRowKey={(row) => row.id}
        />
      </div>

      <TldPricingDialog open={dialogOpen} onOpenChange={setDialogOpen} item={editingItem} categories={categories} />
    </div>
  );
}
