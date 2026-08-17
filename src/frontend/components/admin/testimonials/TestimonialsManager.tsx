"use client";

import { useState } from "react";
import { Plus, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { TestimonialDialog } from "@/components/admin/testimonials/TestimonialDialog";
import { deleteTestimonialAction } from "@/app/admin/testimonials/actions";
import { cn } from "@/lib/utils";
import type { AdminTestimonialDto } from "@/lib/types/admin";

// unpaged-list-in-Dialog - mirror ServiceCategoriesManager.tsx (Phase 6.7).
export function TestimonialsManager({ testimonials }: { testimonials: AdminTestimonialDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<AdminTestimonialDto | null>(null);

  function openCreateDialog() {
    setEditingTestimonial(null);
    setDialogOpen(true);
  }

  function openEditDialog(testimonial: AdminTestimonialDto) {
    setEditingTestimonial(testimonial);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminTestimonialDto>[] = [
    {
      key: "displayName",
      header: "Người đánh giá",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.avatarUrl} alt="" className="size-8 rounded-full border border-zinc-200 object-cover" />
          ) : (
            <div className="size-8 rounded-full bg-zinc-100" />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-zinc-900">{row.displayName}</span>
            {row.companyName && <span className="text-xs text-zinc-500">{row.companyName}</span>}
          </div>
        </div>
      ),
    },
    {
      key: "content",
      header: "Nội dung",
      className: "max-w-md",
      cell: (row) => <span className="line-clamp-2">{row.content}</span>,
    },
    {
      key: "rating",
      header: "Đánh giá",
      cell: (row) =>
        row.rating ? (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn("size-3.5", i < row.rating! ? "fill-amber-400 text-amber-400" : "text-zinc-200")}
              />
            ))}
          </div>
        ) : (
          "-"
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
            aria-label={`Sửa đánh giá của ${row.displayName}`}
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.displayName} onConfirm={() => deleteTestimonialAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Đánh giá khách hàng</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Quản lý các đánh giá hiển thị ở trang Khách hàng.</p>
        </div>
        <Button
          className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800"
          onClick={openCreateDialog}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Thêm đánh giá
        </Button>
      </div>

      <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <DataTable
          columns={columns}
          data={testimonials}
          emptyMessage="Chưa có đánh giá nào."
          getRowKey={(row) => row.id}
        />
      </div>

      <TestimonialDialog open={dialogOpen} onOpenChange={setDialogOpen} testimonial={editingTestimonial} />
    </div>
  );
}
