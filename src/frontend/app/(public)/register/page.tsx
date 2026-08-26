import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customerSession";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản Cloudverse để bắt đầu triển khai dịch vụ VPS, Hosting, Domain.",
};

export default async function RegisterPage() {
  const session = await getCustomerSession();
  if (session) {
    redirect("/khach-hang");
  }

  return (
    <AuthPageShell title="Tạo tài khoản mới" subtitle="Bắt đầu hành trình cùng Cloudverse">
      <RegisterForm />
    </AuthPageShell>
  );
}
