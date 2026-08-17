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
            <img src={row.iconUrl} alt="" className="size-8 rounded-lg border border-gray-200 object-cover" />
          ) : (
            <div className="size-8 rounded-lg bg-gray-100" />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{row.name}</span>
            <span className="text-xs text-gray-500">{row.slug}</span>
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
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Sửa ${row.name}`} onClick={() => openEditDialog(row)}>
            <Pencil className="size-4" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={() => deleteServiceCategoryAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" data-icon="inline-start" />
          Thêm danh mục
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={categories}
        emptyMessage="Chưa có danh mục dịch vụ nào."
        getRowKey={(row) => row.id}
      />

      <ServiceCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editingCategory} />
    </div>
  );
}
