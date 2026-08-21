"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { createUserAction, updateUserAction } from "@/app/admin/users/actions";
import type { AdminUserDto } from "@/lib/types/admin";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserDto | null;
}

interface FormState {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  isActive: boolean;
  roleIds: number[];
}

const EMPTY_FORM: FormState = {
  username: "",
  email: "",
  fullName: "",
  phoneNumber: "",
  password: "",
  isActive: true,
  roleIds: [],
};

const ROLE_NAME_TO_ID: Record<string, number> = { Admin: 1, Editor: 2 };

interface FormErrors {
  username?: string;
  email?: string;
  fullName?: string;
  password?: string;
  roleIds?: string;
}

// RoleIds là mảng (1 user có thể vừa Admin vừa Editor, khớp shape nhiều-nhiều của AppUserRole) - dựng
// 2 toggle-switch riêng thay vì <Select> đơn, theo đúng style custom-switch đã dùng cho isActive ở
// mọi Dialog khác trong dự án (không có sẵn pattern nhóm checkbox cố định nào để tái dùng).
export function UserDialog({ open, onOpenChange, user }: UserDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function syncForm() {
      if (!open) return;
      if (user) {
        setForm({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber ?? "",
          password: "",
          isActive: user.isActive,
          roleIds: user.roles.map((name) => ROLE_NAME_TO_ID[name]).filter((id): id is number => id !== undefined),
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
    }
    syncForm();
  }, [open, user]);

  function toggleRole(roleId: number, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      roleIds: checked ? [...prev.roleIds, roleId] : prev.roleIds.filter((id) => id !== roleId),
    }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!user && !form.username.trim()) nextErrors.username = "Vui lòng nhập tên đăng nhập";
    if (!form.email.trim()) nextErrors.email = "Vui lòng nhập email";
    if (!form.fullName.trim()) nextErrors.fullName = "Vui lòng nhập họ tên";
    if (!user && !form.password.trim()) nextErrors.password = "Vui lòng nhập mật khẩu";
    if (form.roleIds.length === 0) nextErrors.roleIds = "Vui lòng chọn ít nhất 1 vai trò";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = user
        ? await updateUserAction(user.id, {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            phoneNumber: form.phoneNumber.trim() || undefined,
            isActive: form.isActive,
            roleIds: form.roleIds,
          })
        : await createUserAction({
            username: form.username.trim(),
            email: form.email.trim(),
            fullName: form.fullName.trim(),
            phoneNumber: form.phoneNumber.trim() || undefined,
            password: form.password,
            roleIds: form.roleIds,
          });

      if (!result.success) {
        if (result.message.includes("Tên đăng nhập")) {
          setErrors((prev) => ({ ...prev, username: result.message }));
        } else if (result.message.includes("Email")) {
          setErrors((prev) => ({ ...prev, email: result.message }));
        } else if (result.message.includes("vai trò")) {
          setErrors((prev) => ({ ...prev, roleIds: result.message }));
        } else {
          toast.error(result.message);
        }
        return;
      }

      toast.success(user ? "Đã cập nhật nhân viên" : "Đã thêm nhân viên mới");
      onOpenChange(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-[24px]">
        <form onSubmit={handleSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{user ? "Sửa nhân viên" : "Thêm nhân viên"}</DialogTitle>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field>
              <Label htmlFor="user-username">Tên đăng nhập</Label>
              <Input
                id="user-username"
                value={form.username}
                disabled={!!user}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                aria-invalid={!!errors.username}
              />
              <FieldError errors={errors.username ? [{ message: errors.username }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                aria-invalid={!!errors.email}
              />
              <FieldError errors={errors.email ? [{ message: errors.email }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="user-fullname">Họ tên</Label>
              <Input
                id="user-fullname"
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                aria-invalid={!!errors.fullName}
              />
              <FieldError errors={errors.fullName ? [{ message: errors.fullName }] : undefined} />
            </Field>

            <Field>
              <Label htmlFor="user-phone">Số điện thoại</Label>
              <Input
                id="user-phone"
                value={form.phoneNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </Field>

            {!user && (
              <Field>
                <Label htmlFor="user-password">Mật khẩu</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  aria-invalid={!!errors.password}
                />
                <FieldError errors={errors.password ? [{ message: errors.password }] : undefined} />
              </Field>
            )}

            <Field>
              <Label>Vai trò</Label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 1, name: "Admin" },
                  { id: 2, name: "Editor" },
                ].map((role) => (
                  <label
                    key={role.id}
                    htmlFor={`user-role-${role.id}`}
                    className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
                  >
                    <div className="relative flex items-center">
                      <input
                        id={`user-role-${role.id}`}
                        type="checkbox"
                        checked={form.roleIds.includes(role.id)}
                        onChange={(e) => toggleRole(role.id, e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600/20" />
                      <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
                    </div>
                    {role.name}
                  </label>
                ))}
              </div>
              <FieldError errors={errors.roleIds ? [{ message: errors.roleIds }] : undefined} />
            </Field>

            <label
              htmlFor="user-active"
              className="flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-700"
            >
              <div className="relative flex items-center">
                <input
                  id="user-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-zinc-200 transition-colors peer-checked:bg-emerald-600 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600/20" />
                <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              Đang hoạt động
            </label>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="rounded-full bg-zinc-900 px-6 text-white hover:bg-zinc-800">
              {isSubmitting ? "Đang lưu..." : "Lưu nhân viên"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
