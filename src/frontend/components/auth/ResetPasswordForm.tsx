"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PASSWORD_PATTERN, PASSWORD_POLICY_ERROR, PASSWORD_POLICY_HINT } from "@/lib/auth/passwordPolicy";

interface ResetPasswordErrors {
  newPassword?: string;
  confirmPassword?: string;
}

// Nhận token qua prop (page.tsx đọc từ searchParams, đây là Client Component nên không tự đọc được).
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: ResetPasswordErrors = {};
    if (!newPassword) {
      nextErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (!PASSWORD_PATTERN.test(newPassword)) {
      nextErrors.newPassword = PASSWORD_POLICY_ERROR;
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
      const res = await fetch("/api/customer-auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      }

      toast.success("Đặt lại mật khẩu thành công, vui lòng đăng nhập");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đặt lại mật khẩu thất bại, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="reset-new-password">Mật khẩu mới</Label>
          <PasswordInput
            id="reset-new-password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            aria-invalid={!!errors.newPassword}
          />
          {errors.newPassword ? (
            <FieldError errors={[{ message: errors.newPassword }]} />
          ) : (
            <p className="text-xs text-muted-foreground">{PASSWORD_POLICY_HINT}</p>
          )}
        </Field>

        <Field>
          <Label htmlFor="reset-confirm-password">Xác nhận mật khẩu mới</Label>
          <PasswordInput
            id="reset-confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
          />
          <FieldError errors={errors.confirmPassword ? [{ message: errors.confirmPassword }] : undefined} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="btn-shine h-11 w-full text-base font-semibold shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_45%,transparent)] transition-transform hover:scale-[1.02]"
      >
        {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </Button>
    </form>
  );
}
