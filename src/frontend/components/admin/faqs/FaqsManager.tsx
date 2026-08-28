"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { FaqDialog } from "@/components/admin/faqs/FaqDialog";
import { FaqsFilterBar } from "@/components/admin/faqs/FaqsFilterBar";
import { deleteFaqAction } from "@/app/admin/faqs/actions";
import type { AdminFaqDto, AdminServiceCategoryDto } from "@/lib/types/admin";

interface FaqsManagerProps {
  faqs: AdminFaqDto[];
  categories: AdminServiceCategoryDto[];
  currentSearch?: string;
}

// unpaged-list-in-Dialog - mirror ServiceCategoriesManager. ServiceCategoryId là optional nên bảng
// hiện "Tất cả danh mục" khi null (map qua categories đã fetch song song ở page.tsx).
export function FaqsManager({ faqs, categories, currentSearch }: FaqsManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<AdminFaqDto | null>(null);

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  function openCreateDialog() {
    setEditingFaq(null);
    setDialogOpen(true);
  }

  function openEditDialog(faq: AdminFaqDto) {
    setEditingFaq(faq);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminFaqDto>[] = [
    {
      key: "question",
      header: "Câu hỏi",
      className: "max-w-md",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="line-clamp-2 font-medium text-zinc-900">{row.question}</span>
          <span className="line-clamp-1 text-xs text-zinc-500">{row.answer}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Danh mục áp dụng",
      cell: (row) =>
        row.serviceCategoryId ? (categoryNameById.get(row.serviceCategoryId) ?? "-") : "Tất cả danh mục",
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
            aria-label="Sửa câu hỏi"
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.question} onConfirm={() => deleteFaqAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">
            Câu hỏi thường gặp
          </h1>
          <p className="mt-1 text-[14px] text-zinc-500">
            Quản lý danh sách FAQ hiển thị ở trang Dịch vụ và trang Giới thiệu.
          </p>
        </div>
        <Button
          className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800"
          onClick={openCreateDialog}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Thêm câu hỏi
        </Button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <div className="border-b border-zinc-100 bg-zinc-50/30 p-4">
          <FaqsFilterBar currentSearch={currentSearch} />
        </div>
        <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0">
          <DataTable columns={columns} data={faqs} emptyMessage="Chưa có câu hỏi nào." getRowKey={(row) => row.id} />
        </div>
      </div>

      <FaqDialog open={dialogOpen} onOpenChange={setDialogOpen} faq={editingFaq} categories={categories} />
    </div>
  );
}
