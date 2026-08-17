import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { deleteServicePlanAction } from "@/app/admin/service-plans/actions";
import { formatCurrency } from "@/lib/utils";
import type { AdminServicePlanDto } from "@/lib/types/admin";

interface ServicePlansTableProps {
  plans: AdminServicePlanDto[];
  categoryNameById: Map<number, string>;
}

// AdminServicePlanDto không có categoryName (chỉ categoryId) - map tên qua danh sách category đã
// fetch song song ở page.tsx, không gọi thêm N request.
function getStartingPrice(plan: AdminServicePlanDto): number | null {
  if (plan.prices.length === 0) return null;
  return Math.min(...plan.prices.map((p) => p.promotionalPrice ?? p.price));
}

export function ServicePlansTable({ plans, categoryNameById }: ServicePlansTableProps) {
  const columns: DataTableColumn<AdminServicePlanDto>[] = [
    {
      key: "name",
      header: "Gói dịch vụ",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.name}</span>
          <span className="text-xs text-gray-500">{row.slug}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Danh mục",
      cell: (row) => categoryNameById.get(row.categoryId) ?? "-",
    },
    {
      key: "price",
      header: "Giá khởi điểm",
      className: "font-mono tabular-nums",
      cell: (row) => {
        const price = getStartingPrice(row);
        return price === null ? "-" : formatCurrency(price);
      },
    },
    {
      key: "featured",
      header: "Nổi bật",
      cell: (row) => (row.isFeatured ? <Badge variant="outline">Nổi bật</Badge> : null),
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
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            render={
              <Link href={`/admin/service-plans/${row.id}/edit`} aria-label={`Sửa ${row.name}`}>
                <Pencil className="size-4" />
              </Link>
            }
          />
          {/* .bind(): ServicePlansTable là Server Component, chỉ Server Action (hoặc bind của nó) mới
              được truyền làm prop function sang Client Component (ConfirmDeleteButton). */}
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={deleteServicePlanAction.bind(null, row.id)} />
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={plans} emptyMessage="Chưa có gói dịch vụ nào." getRowKey={(row) => row.id} />
  );
}
