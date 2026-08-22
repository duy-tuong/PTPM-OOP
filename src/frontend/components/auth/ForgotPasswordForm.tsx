"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Backend luôn trả 204 kể cả email không tồn tại (không lộ thông tin email đã đăng ký) - form chỉ hiển
// thị 1 thông báo chung chung sau khi gửi, không phân biệt email có tồn tại hay không.
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError("Email không đúng định dạng");
      return;
    }
    setError(undefined);

    setIsSubmitting(true);
    try {
      await fetch("/api/customer-auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Nếu email <span className="font-medium text-foreground">{email}</span> đã đăng ký, chúng tôi đã gửi link đặt
          lại mật khẩu. Vui lòng kiểm tra hộp thư.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <FieldGroup>
        <Field>
          <Label htmlFor="forgot-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@congty.vn"
              autoComplete="email"
              aria-invalid={!!error}
              className="h-11 pl-9"
            />
          </div>
          <FieldError errors={error ? [{ message: error }] : undefined} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="btn-shine h-11 w-full text-base font-semibold shadow-[0_0_24px_color-mix(in_oklch,var(--primary)_45%,transparent)] transition-transform hover:scale-[1.02]"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
