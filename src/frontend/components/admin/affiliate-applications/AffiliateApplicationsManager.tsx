"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { AffiliateStatusBadge } from "@/components/admin/AffiliateStatusBadge";
import { AffiliateStatusDialog } from "@/components/admin/affiliate-applications/AffiliateStatusDialog";
import { formatDate } from "@/lib/utils";
import type { AdminAffiliateApplicationDto } from "@/lib/types/admin";

// Backend không hỗ trợ filter/phân trang cho resource này (List<T> phẳng) - render nguyên danh sách.
export function AffiliateApplicationsManager({ applications }: { applications: AdminAffiliateApplicationDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AdminAffiliateApplicationDto | null>(null);

  function openStatusDialog(application: AdminAffiliateApplicationDto) {
    setSelectedApplication(application);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminAffiliateApplicationDto>[] = [
    {
      key: "applicant",
      header: "Người đăng ký",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{row.fullName}</span>
          <span className="text-xs text-zinc-500">
            {row.email} · {row.phone}
          </span>
        </div>
      ),
    },
    {
      key: "website",
      header: "Website",
      cell: (row) =>
        row.websiteUrl ? (
          <a href={row.websiteUrl} target="_blank" rel="noreferrer" className="text-zinc-700 underline underline-offset-2 hover:text-zinc-900">
            {row.websiteUrl}
          </a>
        ) : (
          "-"
        ),
    },
    {
      key: "promotionPlan",
      header: "Kế hoạch quảng bá",
      className: "max-w-xs",
      cell: (row) => <span className="line-clamp-2">{row.promotionPlan ?? "-"}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => <AffiliateStatusBadge status={row.status} />,
    },
    {
      key: "reviewed",
      header: "Người duyệt",
      cell: (row) =>
        row.reviewedByUserName ? (
          <div className="flex flex-col">
            <span className="text-zinc-900">{row.reviewedByUserName}</span>
            {row.reviewedAt && <span className="text-xs text-zinc-500">{formatDate(row.reviewedAt)}</span>}
          </div>
        ) : (
          "-"
        ),
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            aria-label={`Duyệt đăng ký của ${row.fullName}`}
            onClick={() => openStatusDialog(row)}
          >
            <Pencil className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <DataTable
          columns={columns}
          data={applications}
          emptyMessage="Chưa có đăng ký affiliate nào."
          getRowKey={(row) => row.id}
        />
      </div>
      <AffiliateStatusDialog open={dialogOpen} onOpenChange={setDialogOpen} application={selectedApplication} />
    </>
  );
}
