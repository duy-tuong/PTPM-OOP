"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <Card className="shadow-none border-border/50 overflow-hidden bg-card">
      <CardHeader className="border-b border-border/40 bg-muted/10 pb-5">
        <CardTitle className="text-xl font-bold">Đổi mật khẩu</CardTitle>
        <CardDescription>
          Đảm bảo tài khoản của bạn đang sử dụng mật khẩu dài và an toàn
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <div className="mb-8">
            <h3 className="text-[16px] font-semibold text-foreground">Bảo mật tài khoản</h3>
            <p className="text-[13px] text-muted-foreground mt-1 mb-5">Đổi mật khẩu định kỳ giúp tăng cường bảo mật cho tài khoản của bạn.</p>

            <FieldGroup className="max-w-xl space-y-5">
              <Field>
                <Label htmlFor="change-current-password" className="text-[14px] font-medium">Mật khẩu hiện tại</Label>
                <PasswordInput
                  id="change-current-password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  autoComplete="current-password"
                  aria-invalid={!!errors.currentPassword}
                  className="rounded-[8px] border-border/60 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all shadow-sm bg-background"
                />
                <FieldError errors={errors.currentPassword ? [{ message: errors.currentPassword }] : undefined} />
              </Field>

              <Field>
                <Label htmlFor="change-new-password" className="text-[14px] font-medium">Mật khẩu mới</Label>
                <PasswordInput
                  id="change-new-password"
                  value={newPassword}
                  onChange={setNewPassword}
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  className="rounded-[8px] border-border/60 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all shadow-sm bg-background"
                />
                <FieldError errors={errors.newPassword ? [{ message: errors.newPassword }] : undefined} />
              </Field>

              <Field>
                <Label htmlFor="change-confirm-password" className="text-[14px] font-medium">Xác nhận mật khẩu mới</Label>
                <PasswordInput
                  id="change-confirm-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  className="rounded-[8px] border-border/60 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500 transition-all shadow-sm bg-background"
                />
                <FieldError errors={errors.confirmPassword ? [{ message: errors.confirmPassword }] : undefined} />
              </Field>
            </FieldGroup>
          </div>

          <div className="border-t border-border/40 pt-6 mt-2 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || (!currentPassword && !newPassword && !confirmPassword)} 
              className={cn(
                "h-11 px-8 rounded-[8px] font-semibold transition-all w-full sm:w-auto",
                (currentPassword || newPassword || confirmPassword) ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" : "bg-muted text-muted-foreground shadow-none"
              )}
            >
              {isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
