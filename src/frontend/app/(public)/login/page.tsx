import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/auth/customerSession";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { isSafeRedirectPath } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản Cloudverse để quản lý dịch vụ VPS, Hosting, Domain của bạn.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const [session, params] = await Promise.all([getCustomerSession(), searchParams]);
  if (session) {
    // Khách đã đăng nhập nhưng vẫn hạ cánh /login?redirect=... (vd bấm lại CTA cũ đã mở sẵn ở tab
    // khác) - đưa thẳng về đích thay vì luôn về /khach-hang, khớp hành vi LoginForm.tsx sau khi đăng
    // nhập thành công.
    redirect(isSafeRedirectPath(params.redirect) ? params.redirect : "/khach-hang");
  }

  return (
    <AuthPageShell title="Đăng nhập" subtitle="Chào mừng trở lại Cloudverse">
      <LoginForm />
    </AuthPageShell>
  );
}
