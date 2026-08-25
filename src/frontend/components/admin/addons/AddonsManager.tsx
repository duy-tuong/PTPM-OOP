"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { AddonDialog } from "@/components/admin/addons/AddonDialog";
import { deleteAddonAction } from "@/app/admin/addons/actions";
import { ADDON_TYPE_LABELS, ADDON_BILLING_TYPE_LABELS } from "@/lib/types/enums";
import { formatCurrency } from "@/lib/utils";
import type { AdminAddonDto } from "@/lib/types/admin";

// unpaged-list-in-Dialog: getAdminAddons trả về danh sách phẳng (không phân trang), khớp
// ServiceCategoriesManager.tsx - Addon là danh mục nhỏ, không cần phân trang.
export function AddonsManager({ addons }: { addons: AdminAddonDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<AdminAddonDto | null>(null);

  function openCreateDialog() {
    setEditingAddon(null);
    setDialogOpen(true);
  }

  function openEditDialog(addon: AdminAddonDto) {
    setEditingAddon(addon);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminAddonDto>[] = [
    {
      key: "name",
      header: "Addon",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{row.name}</span>
          <span className="text-xs text-zinc-500">{row.sku}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "Loại",
      cell: (row) => ADDON_TYPE_LABELS[row.type] ?? row.type,
    },
    {
      key: "billingType",
      header: "Cách tính giá",
      cell: (row) => (
        <div className="flex flex-col">
          <span>{ADDON_BILLING_TYPE_LABELS[row.billingType] ?? row.billingType}</span>
          {row.unitName && <span className="text-xs text-zinc-500">/ {row.unitName}</span>}
        </div>
      ),
    },
    {
      key: "price",
      header: "Đơn giá / tháng",
      className: "font-mono tabular-nums",
      cell: (row) => formatCurrency(row.pricePerMonth),
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
          <Button variant="ghost" size="icon-sm" className="text-zinc-400 hover:text-zinc-900 transition-colors" aria-label={`Sửa ${row.name}`} onClick={() => openEditDialog(row)}>
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={() => deleteAddonAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Tiện ích mua kèm</h1>
          <p className="mt-1 text-[14px] text-zinc-500">
            IP phụ, ổ đĩa, bản quyền, dịch vụ quản trị... gắn kèm gói dịch vụ ở trang Dịch vụ.
          </p>
        </div>
        <Button className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800" onClick={openCreateDialog}>
          <Plus className="size-4" data-icon="inline-start" />
          Thêm addon
        </Button>
      </div>

      <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <DataTable columns={columns} data={addons} emptyMessage="Chưa có addon nào." getRowKey={(row) => row.id} />
      </div>

      <AddonDialog open={dialogOpen} onOpenChange={setDialogOpen} addon={editingAddon} />
    </div>
  );
}
