"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConsultationStatusBadge } from "@/components/admin/ConsultationStatusBadge";
import { ConsultationStatusDialog } from "@/components/admin/consultation-requests/ConsultationStatusDialog";
import { formatDate } from "@/lib/utils";
import type { AdminConsultationRequestDto } from "@/lib/types/admin";

// Nhận danh sách của trang hiện tại (đã phân trang server-side qua PagedResult<T> - xem
// app/admin/consultation-requests/page.tsx) - không tự chế UI filter hứa hẹn chức năng không có thật.
export function ConsultationRequestsManager({ requests }: { requests: AdminConsultationRequestDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdminConsultationRequestDto | null>(null);

  function openStatusDialog(request: AdminConsultationRequestDto) {
    setSelectedRequest(request);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminConsultationRequestDto>[] = [
    {
      key: "requestCode",
      header: "Mã yêu cầu",
      className: "font-mono",
      cell: (row) => row.requestCode,
    },
    {
      key: "sender",
      header: "Người gửi",
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
      key: "subject",
      header: "Chủ đề",
      className: "max-w-xs",
      cell: (row) => <span className="line-clamp-2">{row.subject}</span>,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => <ConsultationStatusBadge status={row.status} />,
    },
    {
      key: "assignedTo",
      header: "Người phụ trách",
      cell: (row) => row.assignedToUserName ?? "-",
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
            aria-label={`Cập nhật trạng thái yêu cầu ${row.requestCode}`}
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
          data={requests}
          emptyMessage="Chưa có yêu cầu tư vấn nào."
          getRowKey={(row) => row.id}
        />
      </div>
      <ConsultationStatusDialog open={dialogOpen} onOpenChange={setDialogOpen} request={selectedRequest} />
    </>
  );
}
