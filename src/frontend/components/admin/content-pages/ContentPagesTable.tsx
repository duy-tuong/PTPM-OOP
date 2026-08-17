import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PublishBadge } from "@/components/admin/PublishBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteContentPageAction } from "@/app/admin/content-pages/actions";
import { formatDate } from "@/lib/utils";
import type { AdminContentPageDto } from "@/lib/types/admin";

export function ContentPagesTable({ pages }: { pages: AdminContentPageDto[] }) {
  const columns: DataTableColumn<AdminContentPageDto>[] = [
    {
      key: "title",
      header: "Trang",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{row.title}</span>
          <span className="text-xs text-zinc-500">/{row.slug}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => <PublishBadge isPublished={row.isPublished} />,
    },
    {
      key: "publishedAt",
      header: "Ngày xuất bản",
      cell: (row) => (row.publishedAt ? formatDate(row.publishedAt) : "-"),
    },
    {
      key: "displayOrder",
      header: "Thứ tự",
      className: "font-mono tabular-nums",
      cell: (row) => row.displayOrder,
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
            nativeButton={false}
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            render={
              <Link href={`/admin/content-pages/${row.id}/edit`} aria-label={`Sửa ${row.title}`}>
                <Pencil className="size-3.5" />
              </Link>
            }
          />
          {/* .bind(): ContentPagesTable là Server Component - chỉ Server Action (hoặc bind của nó) mới
              được truyền làm prop function sang Client Component (ConfirmDeleteButton). */}
          <ConfirmDeleteButton itemLabel={row.title} onConfirm={deleteContentPageAction.bind(null, row.id)} />
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={pages} emptyMessage="Chưa có trang nội dung nào." getRowKey={(row) => row.id} />
  );
}
