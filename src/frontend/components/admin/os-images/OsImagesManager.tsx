"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { OsImageDialog } from "@/components/admin/os-images/OsImageDialog";
import { OsImagesFilterBar } from "@/components/admin/os-images/OsImagesFilterBar";
import { deleteOsImageAction } from "@/app/admin/os-images/actions";
import { OS_FAMILY_LABELS } from "@/lib/types/enums";
import { formatCurrency } from "@/lib/utils";
import type { AdminOsImageDto } from "@/lib/types/admin";

// `osImages` là 1 TRANG (page.tsx đã phân trang qua getAdminOsImages) - Sửa chỉ prefill từ record đã
// có sẵn trong mảng của trang hiện tại, không fetch lại theo id.
export function OsImagesManager({ osImages, currentSearch }: { osImages: AdminOsImageDto[]; currentSearch?: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOsImage, setEditingOsImage] = useState<AdminOsImageDto | null>(null);

  function openCreateDialog() {
    setEditingOsImage(null);
    setDialogOpen(true);
  }

  function openEditDialog(osImage: AdminOsImageDto) {
    setEditingOsImage(osImage);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminOsImageDto>[] = [
    {
      key: "name",
      header: "Hệ điều hành",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{row.name}</span>
          <span className="text-xs text-zinc-500">{row.slug}</span>
        </div>
      ),
    },
    {
      key: "family",
      header: "Nhóm",
      cell: (row) => OS_FAMILY_LABELS[row.family] ?? row.family,
    },
    {
      key: "licenseFee",
      header: "Phí bản quyền / tháng",
      className: "font-mono tabular-nums",
      cell: (row) => (row.windowsLicenseFeePerMonth ? formatCurrency(row.windowsLicenseFeePerMonth) : "Miễn phí"),
    },
    {
      key: "displayOrder",
      header: "Thứ tự",
      cell: (row) => row.displayOrder,
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
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={() => deleteOsImageAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Hệ điều hành</h1>
          <p className="mt-1 text-[14px] text-zinc-500">
            Danh mục OS Linux/Windows để gắn vào gói dịch vụ ở trang Dịch vụ - Windows có phụ phí bản quyền cố định/tháng.
          </p>
        </div>
        <Button className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800" onClick={openCreateDialog}>
          <Plus className="size-4" data-icon="inline-start" />
          Thêm hệ điều hành
        </Button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <div className="border-b border-zinc-100 bg-zinc-50/30 p-4">
          <OsImagesFilterBar currentSearch={currentSearch} />
        </div>
        <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0">
          <DataTable columns={columns} data={osImages} emptyMessage="Chưa có hệ điều hành nào." getRowKey={(row) => row.id} />
        </div>
      </div>

      <OsImageDialog open={dialogOpen} onOpenChange={setDialogOpen} osImage={editingOsImage} />
    </div>
  );
}
