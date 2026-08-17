"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { PasswordInput } from "@/components/auth/PasswordInput";

interface AdminLoginFormErrors {
  usernameOrEmail?: string;
  password?: string;
}

// Đăng nhập cho AppUser (Admin/Editor) - hoàn toàn tách biệt bảng/route với Customer (lib/api/auth.ts,
// gọi POST /api/auth/login qua Route Handler app/api/auth/login/route.ts, KHÁC namespace
// /api/customer-auth/*). Không có remember-me/social login/link đăng ký - tài khoản Admin/Editor được
// seed sẵn, không tự đăng ký.
export function AdminLoginForm() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<AdminLoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: AdminLoginFormErrors = {};
    if (!usernameOrEmail.trim()) {
      nextErrors.usernameOrEmail = "Vui lòng nhập tên đăng nhập hoặc email";
    }
    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setErrors({ password: "Sai tên đăng nhập hoặc mật khẩu" });
        } else {
          setErrors({ password: "Đăng nhập thất bại, vui lòng thử lại" });
        }
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="admin-username">Tên đăng nhập hoặc Email</Label>
          <div className="relative">
            <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="admin-username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              aria-invalid={!!errors.usernameOrEmail}
              className="h-11 pl-9"
            />
          </div>
          <FieldError errors={errors.usernameOrEmail ? [{ message: errors.usernameOrEmail }] : undefined} />
        </Field>

        <Field>
          <Label htmlFor="admin-password">Mật khẩu</Label>
          <PasswordInput
            id="admin-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
          />
          <FieldError errors={errors.password ? [{ message: errors.password }] : undefined} />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="h-11 w-full text-base font-semibold">
        {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
