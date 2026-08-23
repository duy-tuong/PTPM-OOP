import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "Đặt lại mật khẩu tài khoản Cloudverse của bạn.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell title="Quên mật khẩu" subtitle="Nhập email để nhận link đặt lại mật khẩu">
      <ForgotPasswordForm />
    </AuthPageShell>
  );
}
