import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  description: "Đặt lại mật khẩu tài khoản Cloudverse của bạn.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthPageShell title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới cho tài khoản của bạn">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground">Link đặt lại mật khẩu không hợp lệ.</p>
          <Link href="/quen-mat-khau" className="text-sm font-medium text-primary hover:underline">
            Yêu cầu link mới
          </Link>
        </div>
      )}
    </AuthPageShell>
  );
}
