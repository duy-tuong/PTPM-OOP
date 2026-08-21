"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PartnerDialog } from "@/components/admin/partners/PartnerDialog";
import { deletePartnerAction } from "@/app/admin/partners/actions";
import type { AdminPartnerDto } from "@/lib/types/admin";

// unpaged-list-in-Dialog - mirror ServiceCategoriesManager.tsx (Phase 6.7).
export function PartnersManager({ partners }: { partners: AdminPartnerDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<AdminPartnerDto | null>(null);

  function openCreateDialog() {
    setEditingPartner(null);
    setDialogOpen(true);
  }

  function openEditDialog(partner: AdminPartnerDto) {
    setEditingPartner(partner);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminPartnerDto>[] = [
    {
      key: "name",
      header: "Đối tác",
      cell: (row) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={row.logoUrl} alt="" className="size-8 rounded-lg border border-zinc-200 object-contain p-1" />
          <div className="flex flex-col">
            <span className="font-medium text-zinc-900">{row.name}</span>
            {row.websiteUrl && <span className="text-xs text-zinc-500">{row.websiteUrl}</span>}
          </div>
        </div>
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
            aria-label={`Sửa ${row.name}`}
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.name} onConfirm={() => deletePartnerAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Đối tác</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Quản lý logo đối tác hiển thị ở trang Đối tác.</p>
        </div>
        <Button
          className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800"
          onClick={openCreateDialog}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Thêm đối tác
        </Button>
      </div>

      <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <DataTable columns={columns} data={partners} emptyMessage="Chưa có đối tác nào." getRowKey={(row) => row.id} />
      </div>

      <PartnerDialog open={dialogOpen} onOpenChange={setDialogOpen} partner={editingPartner} />
    </div>
  );
}
