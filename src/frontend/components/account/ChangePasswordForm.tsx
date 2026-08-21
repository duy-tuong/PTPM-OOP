"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { notifyCustomerSessionChanged } from "@/lib/auth/customerSessionClient";

interface ChangePasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Backend tự null hoá RefreshToken sau khi đổi mật khẩu thành công (buộc đăng nhập lại mọi thiết bị) -
// vì vậy sau khi thành công, form tự gọi tiếp /api/customer-auth/logout để xoá cookie phía client cho
// nhất quán trạng thái, rồi đưa về /login.
export function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ChangePasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: ChangePasswordErrors = {};
    if (!currentPassword) {
      nextErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }
    if (!newPassword) {
      nextErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customer-auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        if (res.status === 401) {
          setErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
          return;
        }
        throw new Error(data?.message ?? "Đổi mật khẩu thất bại, vui lòng thử lại.");
      }

      await fetch("/api/customer-auth/logout", { method: "POST" });
      notifyCustomerSessionChanged();
      toast.success("Đổi mật khẩu thành công, vui lòng đăng nhập lại");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đổi mật khẩu thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-lg flex-col gap-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="change-current-password">Mật khẩu hiện tại</Label>
          <PasswordInput
            id="change-current-password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            aria-invalid={!!errors.currentPassword}
          />
          <FieldError errors={errors.currentPassword ? [{ message: errors.currentPassword }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="change-new-password">Mật khẩu mới</Label>
          <PasswordInput
            id="change-new-password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
          />
          <FieldError errors={errors.newPassword ? [{ message: errors.newPassword }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="change-confirm-password">Xác nhận mật khẩu mới</Label>
          <PasswordInput
            id="change-confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
          />
          <FieldError errors={errors.confirmPassword ? [{ message: errors.confirmPassword }] : undefined} />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="h-11 w-fit px-8 text-base font-semibold">
        {isSubmitting ? "Đang xử lý..." : "Đổi mật khẩu"}
      </Button>
    </form>
  );
}
