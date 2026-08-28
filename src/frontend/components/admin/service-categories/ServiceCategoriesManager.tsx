"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { ServiceCategoryDialog } from "@/components/admin/service-categories/ServiceCategoryDialog";
import { deleteServiceCategoryAction } from "@/app/admin/service-categories/actions";
import { FallbackImage } from "@/components/shared/FallbackImage";
import type { AdminServiceCategoryDto } from "@/lib/types/admin";

// `categories` là 1 TRANG (page.tsx đã phân trang qua getAdminServiceCategories) - Sửa chỉ prefill từ
// record đã có sẵn trong mảng của trang hiện tại, không fetch lại theo id.
// `canManage` = true khi session có role Admin (page.tsx tính sẵn) - Create/Update/Delete ở
// AdminServiceCategoriesController chỉ [Authorize(Roles="Admin")], Editor gọi sẽ bị 403. Editor vẫn
// được xem danh sách (GetList là Admin,Editor) nên chỉ ẩn nút "Thêm danh mục" + cột thao tác Sửa/Xoá,
// không chặn hẳn cả trang - mirror đúng cách order-requests/page.tsx ẩn riêng ExportButton cho Editor.
export function ServiceCategoriesManager({
  categories,
  canManage,
}: {
  categories: AdminServiceCategoryDto[];
  canManage: boolean;
}) {
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
          <FallbackImage
            src={row.iconUrl}
            alt={row.name}
            className="size-8 rounded-lg border border-zinc-200 object-cover"
            fallbackClassName="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-xs font-semibold text-zinc-600"
          />
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
    ...(canManage
      ? [
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
          } satisfies DataTableColumn<AdminServiceCategoryDto>,
        ]
      : []),
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
        {canManage && (
          <Button className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800" onClick={openCreateDialog}>
            <Plus className="size-4" data-icon="inline-start" />
            Thêm danh mục
          </Button>
        )}
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
