import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customerSession";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản Cloudverse để quản lý dịch vụ VPS, Hosting, Domain của bạn.",
};

export default async function LoginPage() {
  const session = await getCustomerSession();
  if (session) {
    redirect("/khach-hang");
  }

  return (
    <AuthPageShell title="Đăng nhập" subtitle="Chào mừng trở lại Cloudverse">
      <LoginForm />
    </AuthPageShell>
  );
}
