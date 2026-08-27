import type { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  description: "Đăng nhập dành cho Admin/Editor quản lý hệ thống Cloudverse.",
};

// Giao diện light mode (khác hẳn theme tối Cloudverse của trang public) - dùng thẳng :root neutral
// tokens của shadcn, không tái dùng .glass-card/.text-gradient-primary (thiết kế cho nền tối nhiều lớp
// trang trí, trên nền sáng phẳng sẽ gần như vô hình/xám xịt). Bố cục tối giản, không blob nền/Parallax
// như AuthPageShell của Customer - Admin cần cảm giác "công cụ làm việc", không phải landing page.
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/adminSession";
import { ParticleNetworkBackground } from "@/components/home/effects/ParticleNetworkBackground";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin/dashboard");
  }

  return (
    <>
      <ParticleNetworkBackground />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-16">
      <Logo />

      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Đăng nhập quản trị</CardTitle>
          <CardDescription>Dành cho Admin/Editor quản lý hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </div>
    </>
  );
}
