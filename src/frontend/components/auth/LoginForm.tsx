"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup, FieldSeparator } from "@/components/ui/field";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { notifyCustomerSessionChanged, readCustomerSessionCookie } from "@/lib/auth/customerSessionClient";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginFormErrors {
  email?: string;
  password?: string;
}

// Gọi thật qua Route Handler app/api/customer-auth/login/route.ts (proxy server-side, set cookie
// httpOnly) - KHÔNG gọi lib/api/customerAuth.ts#loginCustomer trực tiếp từ đây (hàm đó server-only).
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: LoginFormErrors = {};
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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/customer-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setErrors({ password: "Sai email hoặc mật khẩu" });
        } else {
          toast.error("Đăng nhập thất bại, vui lòng thử lại");
        }
        return;
      }

      const data = (await res.json()) as { fullName: string };

      // Phòng thủ tầng ứng dụng (xem plan chẩn đoán lỗi đăng nhập production) - backend trả 200 không
      // đồng nghĩa cookie đã thực sự được Route Handler set vào trình duyệt (vd hạ tầng route request
      // thẳng vào backend .NET, bỏ qua Route Handler). Kiểm tra cookie session thật trước khi báo
      // thành công, tránh toast "Chào mừng trở lại" hiện ra dù chưa hề đăng nhập được.
      if (!readCustomerSessionCookie()) {
        toast.error("Đăng nhập thất bại do lỗi hệ thống, vui lòng thử lại sau ít phút.");
        return;
      }

      toast.success(`Chào mừng trở lại, ${data.fullName}`);
      notifyCustomerSessionChanged();
      window.location.href = "/";
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="login-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="login-email"
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
          <Label htmlFor="login-password">Mật khẩu</Label>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
          />
          <FieldError errors={errors.password ? [{ message: errors.password }] : undefined} />
        </Field>

        <div className="flex items-center justify-between">
          <label htmlFor="login-remember" className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              id="login-remember"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer sr-only"
            />
            <span className="flex size-4 items-center justify-center rounded border border-input bg-transparent transition-colors peer-checked:border-primary peer-checked:bg-primary">
              {remember && <Check className="size-3 text-primary-foreground" strokeWidth={3} />}
            </span>
            Ghi nhớ đăng nhập
          </label>

          <Link href="/quen-mat-khau" className="text-sm text-primary hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="btn-shine h-11 w-full text-base font-semibold shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_45%,transparent)] transition-transform hover:scale-[1.02]"
      >
        {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
      </Button>

      <FieldSeparator>Hoặc</FieldSeparator>

      <SocialAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
