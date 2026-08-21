import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { PublishBadge } from "@/components/admin/PublishBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteNewsArticleAction } from "@/app/admin/news-articles/actions";
import { formatDate } from "@/lib/utils";
import type { AdminNewsArticleDto } from "@/lib/types/admin";

interface NewsArticlesTableProps {
  articles: AdminNewsArticleDto[];
  categoryNameById: Map<number, string>;
}

const MAX_VISIBLE_TAGS = 2;

export function NewsArticlesTable({ articles, categoryNameById }: NewsArticlesTableProps) {
  const columns: DataTableColumn<AdminNewsArticleDto>[] = [
    {
      key: "title",
      header: "Bài viết",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.thumbnailUrl} alt="" className="size-10 rounded-lg border border-zinc-200 object-cover" />
          ) : (
            <div className="size-10 rounded-lg bg-zinc-100" />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-zinc-900">{row.title}</span>
            <span className="text-xs text-zinc-500">{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Danh mục",
      cell: (row) => categoryNameById.get(row.newsCategoryId) ?? "-",
    },
    {
      key: "tags",
      header: "Tags",
      cell: (row) =>
        row.tags.length === 0 ? (
          "-"
        ) : (
          <div className="flex flex-wrap gap-1">
            {row.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            {row.tags.length > MAX_VISIBLE_TAGS && (
              <Badge variant="outline">+{row.tags.length - MAX_VISIBLE_TAGS}</Badge>
            )}
          </div>
        ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => <PublishBadge isPublished={row.isPublished} />,
    },
    {
      key: "viewCount",
      header: "Lượt xem",
      className: "font-mono tabular-nums",
      cell: (row) => row.viewCount.toLocaleString("vi-VN"),
    },
    {
      key: "publishedAt",
      header: "Ngày đăng",
      cell: (row) => formatDate(row.publishedAt),
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
              <Link href={`/admin/news-articles/${row.id}/edit`} aria-label={`Sửa ${row.title}`}>
                <Pencil className="size-3.5" />
              </Link>
            }
          />
          <ConfirmDeleteButton itemLabel={row.title} onConfirm={deleteNewsArticleAction.bind(null, row.id)} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={articles}
      emptyMessage="Chưa có bài viết nào."
      getRowKey={(row) => row.id}
    />
  );
}
