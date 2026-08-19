"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { SiteSettingDialog } from "@/components/admin/site-settings/SiteSettingDialog";
import { deleteSiteSettingAction } from "@/app/admin/site-settings/actions";
import type { AdminSiteSettingDto } from "@/lib/types/admin";

// unpaged-list-in-Dialog: getAdminSiteSettings trả về danh sách phẳng - mirror ServiceCategoriesManager.tsx.
export function SiteSettingsManager({ settings }: { settings: AdminSiteSettingDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AdminSiteSettingDto | null>(null);

  function openCreateDialog() {
    setEditingSetting(null);
    setDialogOpen(true);
  }

  function openEditDialog(setting: AdminSiteSettingDto) {
    setEditingSetting(setting);
    setDialogOpen(true);
  }

  const columns: DataTableColumn<AdminSiteSettingDto>[] = [
    {
      key: "key",
      header: "Khoá cấu hình",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm font-medium text-zinc-900">{row.settingKey}</span>
          <span className="text-xs text-zinc-500">{row.settingGroup}</span>
        </div>
      ),
    },
    {
      key: "value",
      header: "Giá trị",
      cell: (row) => <span className="line-clamp-2 text-zinc-700">{row.settingValue}</span>,
    },
    {
      key: "dataType",
      header: "Kiểu dữ liệu",
      cell: (row) => <Badge variant="secondary">{row.dataType}</Badge>,
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
            aria-label={`Sửa ${row.settingKey}`}
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <ConfirmDeleteButton
            itemLabel={`${row.settingKey} (xoá vĩnh viễn)`}
            onConfirm={() => deleteSiteSettingAction(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Cài đặt hệ thống</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Quản lý cấu hình key-value dùng chung cho toàn hệ thống.</p>
        </div>
        <Button className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800" onClick={openCreateDialog}>
          <Plus className="size-4" data-icon="inline-start" />
          Thêm cấu hình
        </Button>
      </div>

      <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-3 text-[13px] text-amber-800">
        Các giá trị này hiện chưa được trang nào trong hệ thống đọc/sử dụng - đây là hạ tầng quản lý cấu
        hình, sẽ có tác dụng khi các phần khác của site bắt đầu đọc theo Khoá cấu hình.
      </div>

      <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <DataTable columns={columns} data={settings} emptyMessage="Chưa có cấu hình nào." getRowKey={(row) => row.id} />
      </div>

      <SiteSettingDialog open={dialogOpen} onOpenChange={setDialogOpen} setting={editingSetting} />
    </div>
  );
}
