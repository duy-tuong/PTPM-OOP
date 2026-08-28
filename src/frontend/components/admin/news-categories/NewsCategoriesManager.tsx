"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { NewsCategoryDialog } from "@/components/admin/news-categories/NewsCategoryDialog";
import { deleteNewsCategoryAction } from "@/app/admin/news-categories/actions";
import type { AdminNewsCategoryDto } from "@/lib/types/admin";

// `categories` là 1 TRANG (page.tsx đã phân trang qua getAdminNewsCategories) - Sửa chỉ prefill từ
// record đã có sẵn trong mảng của trang hiện tại, không fetch lại theo id.
export function NewsCategoriesManager({ categories }: { categories: AdminNewsCategoryDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminNewsCategoryDto | null>(null);

  function openCreateDialog() {
    setEditingCategory(null);
    setDialogOpen(true);
  }

  function openEditDialog(category: AdminNewsCategoryDto) {
    setEditingCategory(category);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminNewsCategoryDto>[] = [
    {
      key: "name",
      header: "Danh mục",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{row.name}</span>
          <span className="text-xs text-zinc-500">{row.slug}</span>
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
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            aria-label={`Sửa ${row.name}`}
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={() => deleteNewsCategoryAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Danh mục tin tức</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Quản lý các nhóm bài viết hiển thị ở trang Tin tức.</p>
        </div>
        <Button
          className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800"
          onClick={openCreateDialog}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Thêm danh mục
        </Button>
      </div>

      <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <DataTable
          columns={columns}
          data={categories}
          emptyMessage="Chưa có danh mục tin tức nào."
          getRowKey={(row) => row.id}
        />
      </div>

      <NewsCategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editingCategory} />
    </div>
  );
}
