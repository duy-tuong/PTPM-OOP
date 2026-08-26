import Link from "next/link";
import { Check, X, ChevronRight } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CustomerActiveStatusButton } from "@/components/admin/customers/CustomerActiveStatusButton";
import { CUSTOMER_TYPE_LABELS } from "@/lib/types/enums";
import { formatDate } from "@/lib/utils";
import type { AdminCustomerDto } from "@/lib/types/admin";

interface CustomersTableProps {
  customers: AdminCustomerDto[];
}

export function CustomersTable({ customers }: CustomersTableProps) {
  const columns: DataTableColumn<AdminCustomerDto>[] = [
    {
      key: "customer",
      header: "Khách hàng",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{row.fullName}</span>
          <span className="text-xs text-zinc-500">{row.email}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Điện thoại",
      cell: (row) => row.phone,
    },
    {
      key: "type",
      header: "Loại khách hàng",
      cell: (row) => (
        <div className="flex flex-col">
          <span>{CUSTOMER_TYPE_LABELS[row.customerType] ?? row.customerType}</span>
          {row.companyName && <span className="text-xs text-zinc-500">{row.companyName}</span>}
        </div>
      ),
    },
    {
      key: "salesRep",
      header: "Sales phụ trách",
      cell: (row) => row.assignedSalesRepUserName ?? <span className="text-zinc-300">-</span>,
    },
    {
      key: "emailVerified",
      header: "Đã xác thực email",
      cell: (row) =>
        row.isEmailVerified ? (
          <Check className="size-4 text-emerald-500" />
        ) : (
          <X className="size-4 text-zinc-300" />
        ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => <StatusBadge isActive={row.isActive} />,
    },
    {
      key: "createdAt",
      header: "Ngày đăng ký",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
          <CustomerActiveStatusButton id={row.id} fullName={row.fullName} isActive={row.isActive} />
          <Link
            href={`/admin/customers/${row.id}`}
            aria-label={`Xem chi tiết khách hàng ${row.fullName}`}
            className="inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] text-zinc-400 transition-colors hover:bg-muted hover:text-zinc-900"
          >
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={customers} emptyMessage="Chưa có khách hàng nào." getRowKey={(row) => row.id} />
  );
}
