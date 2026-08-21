"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { ServiceCategoryDialog } from "@/components/admin/service-categories/ServiceCategoryDialog";
import { deleteServiceCategoryAction } from "@/app/admin/service-categories/actions";
import type { AdminServiceCategoryDto } from "@/lib/types/admin";

// unpaged-list-in-Dialog: getAdminServiceCategories trả về danh sách phẳng (không phân trang) - Sửa
// chỉ prefill từ record đã có sẵn trong mảng, không fetch lại theo id.
export function ServiceCategoriesManager({ categories }: { categories: AdminServiceCategoryDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminServiceCategoryDto | null>(null);

  function openCreateDialog() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: AdminServiceCategoryDto) {
    setEditingCategory(category);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminServiceCategoryDto>[] = [
    {
      key: "name",
      header: "Danh mục",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.iconUrl} alt="" className="size-8 rounded-lg border border-zinc-200 object-cover" />
          ) : (
            <div className="size-8 rounded-lg bg-zinc-100" />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-zinc-900">{row.name}</span>
            <span className="text-xs text-zinc-500">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: "displayOrder",
      header: "Thứ tự",
      className: "font-mono tabular-nums",
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
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={() => deleteServiceCategoryAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Danh mục dịch vụ</h1>
          <p className="mt-1 text-[14px] text-zinc-500">
            Quản lý các nhóm dịch vụ hiển thị trên trang chủ và trang Dịch vụ.
          </p>
        </div>
        <Button className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800" onClick={openCreateDialog}>
          <Plus className="size-4" data-icon="inline-start" />
          Thêm danh mục
        </Button>
      </div>

      <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <DataTable
          columns={columns}
          data={categories}
          emptyMessage="Chưa có danh mục dịch vụ nào."
          getRowKey={(row) => row.id}
        />
      </div>

      <ServiceCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editingCategory} />
    </div>
  );
}
