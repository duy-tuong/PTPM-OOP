import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản Cloudverse để quản lý dịch vụ VPS, Hosting, Domain của bạn.",
};

export default function LoginPage() {
  return (
    <AuthPageShell title="Đăng nhập" subtitle="Chào mừng trở lại Cloudverse">
      <LoginForm />
    </AuthPageShell>
  );
}
