import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { NewsCommentApprovalActions } from "@/components/admin/news-comments/NewsCommentApprovalActions";
import { deleteNewsCommentAction } from "@/app/admin/news-comments/actions";
import { formatDate } from "@/lib/utils";
import type { AdminNewsCommentDto } from "@/lib/types/admin";

interface NewsCommentsTableProps {
  comments: AdminNewsCommentDto[];
}

export function NewsCommentsTable({ comments }: NewsCommentsTableProps) {
  const columns: DataTableColumn<AdminNewsCommentDto>[] = [
    {
      key: "article",
      header: "Bài viết",
      cell: (row) => <span className="line-clamp-2 text-zinc-700">{row.newsArticleTitle}</span>,
    },
    {
      key: "author",
      header: "Người bình luận",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{row.authorDisplayName}</span>
          {row.authorEmail && <span className="text-xs text-zinc-500">{row.authorEmail}</span>}
        </div>
      ),
    },
    {
      key: "content",
      header: "Nội dung",
      cell: (row) => <span className="line-clamp-2 text-zinc-700">{row.content}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) =>
        row.isApproved ? (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 ring-1 ring-inset ring-emerald-500/20">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-[12px] font-medium text-emerald-700">Đã duyệt</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 ring-1 ring-inset ring-amber-500/20">
            <div className="size-1.5 rounded-full bg-amber-500" />
            <span className="text-[12px] font-medium text-amber-700">Chờ duyệt</span>
          </div>
        ),
    },
    {
      key: "createdAt",
      header: "Ngày gửi",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
          <NewsCommentApprovalActions id={row.id} isApproved={row.isApproved} />
          <ConfirmDeleteButton
            itemLabel={`${row.content.slice(0, 40)}${row.content.length > 40 ? "..." : ""} (xoá vĩnh viễn)`}
            onConfirm={deleteNewsCommentAction.bind(null, row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={comments} emptyMessage="Chưa có bình luận nào." getRowKey={(row) => row.id} />
  );
}
