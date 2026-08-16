"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { notifyCustomerSessionChanged } from "@/lib/auth/customerSessionClient";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

// Gọi thật qua Route Handler app/api/customer-auth/register/route.ts - backend đã có bảng Customer
// (RoleId=3 "Customer" seed sẵn) + CustomerAuthController thật, đăng ký xong tự đăng nhập luôn (trả
// token, không bắt xác nhận email - IsEmailVerified/EmailVerificationToken để dành cho phase sau khi
// có dịch vụ gửi email).
export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: RegisterFormErrors = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      nextErrors.fullName = "Vui lòng nhập họ tên đầy đủ";
    }
    if (!email.trim()) {
      nextErrors.email = "Vui lòng nhập email";
    } else if (!EMAIL_PATTERN.test(email)) {
      nextErrors.email = "Email không đúng định dạng";
    }
    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (confirmPassword !== password) {
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
      const res = await fetch("/api/customer-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: "Email đã được sử dụng" });
        } else {
          toast.error("Đăng ký thất bại, vui lòng thử lại");
        }
        return;
      }

      const data = (await res.json()) as { fullName: string };
      toast.success(`Tạo tài khoản thành công, chào mừng ${data.fullName}`);
      notifyCustomerSessionChanged();
      router.push("/");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="register-fullname">Họ và tên</Label>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              aria-invalid={!!errors.fullName}
              className="h-11 pl-9"
            />
          </div>
          <FieldError errors={errors.fullName ? [{ message: errors.fullName }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="register-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@congty.vn"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className="h-11 pl-9"
            />
          </div>
          <FieldError errors={errors.email ? [{ message: errors.email }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="register-password">Mật khẩu</Label>
          <PasswordInput
            id="register-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            aria-invalid={!!errors.password}
          />
          <FieldError errors={errors.password ? [{ message: errors.password }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="register-confirm-password">Xác nhận mật khẩu</Label>
          <PasswordInput
            id="register-confirm-password"
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
        {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
      </Button>

      <FieldSeparator>Hoặc</FieldSeparator>

      <SocialAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
