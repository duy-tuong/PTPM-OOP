import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ServicePlanStatusBadge } from "@/components/admin/ServicePlanStatusBadge";
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
          <span className="font-medium text-zinc-900">{row.name}</span>
          <span className="text-xs text-zinc-500">{row.sku ? `${row.slug} · ${row.sku}` : row.slug}</span>
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
      cell: (row) => (row.isFeatured ? (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 ring-1 ring-inset ring-amber-500/20">
          <div className="size-1.5 rounded-full bg-amber-500" />
          <span className="text-[12px] font-medium text-amber-700">Nổi bật</span>
        </div>
      ) : null),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => <ServicePlanStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-24",
      cell: (row) => (
        <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon-sm"
            nativeButton={false}
            className="text-slate-400 hover:text-zinc-900 transition-colors"
            render={
              <Link href={`/admin/service-plans/${row.id}/edit`} aria-label={`Sửa ${row.name}`}>
                <Pencil className="size-3.5" />
              </Link>
            }
          />
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={deleteServicePlanAction.bind(null, row.id)} />
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={plans} emptyMessage="Chưa có gói dịch vụ nào." getRowKey={(row) => row.id} />
  );
}
