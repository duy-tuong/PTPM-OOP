"use client";

import { useState } from "react";
import { Plus, Pencil, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { UserDialog } from "@/components/admin/users/UserDialog";
import { ResetPasswordDialog } from "@/components/admin/users/ResetPasswordDialog";
import { deleteUserAction } from "@/app/admin/users/actions";
import { formatDate } from "@/lib/utils";
import type { AdminUserDto } from "@/lib/types/admin";

// unpaged-list-in-Dialog: getAdminUsers trả về danh sách phẳng (không phân trang, số lượng nhân viên
// nhỏ) - mirror ServiceCategoriesManager.tsx, cộng 1 Dialog phụ cho đặt lại mật khẩu.
export function UsersManager({ users }: { users: AdminUserDto[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUserDto | null>(null);

  function openCreateDialog() {
    setEditingUser(null);
    setDialogOpen(true);
  }

  function openEditDialog(user: AdminUserDto) {
    setEditingUser(user);
    setDialogOpen(true);
  }

  function openResetPasswordDialog(user: AdminUserDto) {
    setResetPasswordUser(user);
    setResetPasswordOpen(true);
  }

  const columns: DataTableColumn<AdminUserDto>[] = [
    {
      key: "user",
      header: "Nhân viên",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{row.fullName}</span>
          <span className="text-xs text-zinc-500">
            {row.username} · {row.email}
          </span>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Vai trò",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row) => <StatusBadge isActive={row.isActive} />,
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
        <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            aria-label={`Sửa ${row.fullName}`}
            onClick={() => openEditDialog(row)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-zinc-400 hover:text-zinc-900 transition-colors"
            aria-label={`Đặt lại mật khẩu ${row.fullName}`}
            onClick={() => openResetPasswordDialog(row)}
          >
            <KeyRound className="size-3.5" />
          </Button>
          <ConfirmDeleteButton itemLabel={row.fullName} onConfirm={() => deleteUserAction(row.id)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-zinc-900">Quản lý nhân viên</h1>
          <p className="mt-1 text-[14px] text-zinc-500">Tài khoản Admin/Editor được phép đăng nhập trang quản trị.</p>
        </div>
        <Button className="rounded-full bg-zinc-900 px-6 text-white shadow-sm hover:bg-zinc-800" onClick={openCreateDialog}>
          <Plus className="size-4" data-icon="inline-start" />
          Thêm nhân viên
        </Button>
      </div>

      <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:ring-0 overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white shadow-sm ring-1 ring-zinc-950/5">
        <DataTable columns={columns} data={users} emptyMessage="Chưa có nhân viên nào." getRowKey={(row) => row.id} />
      </div>

      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editingUser} />
      <ResetPasswordDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen} user={resetPasswordUser} />
    </div>
  );
}
