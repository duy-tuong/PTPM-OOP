import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { confirmEmailChange } from "@/lib/api/customerAuth";
import { ApiError } from "@/lib/api/http";

export const metadata: Metadata = {
  title: "Xác thực email",
  description: "Xác thực email mới cho tài khoản Cloudverse của bạn.",
};

// Server Component gọi thẳng confirmEmailChange (không qua Route Handler) - endpoint backend là
// [AllowAnonymous], không cần cookie, và route này KHÔNG đặt trong app/khach-hang/** (bị proxy.ts chặn
// yêu cầu đăng nhập) vì access token JWT (30 phút) thường đã hết hạn trước khi link 24h này được bấm.
export default async function ConfirmEmailChangePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let message: string;
  let success = false;

  if (!token) {
    message = "Link xác thực không hợp lệ.";
  } else {
    try {
      await confirmEmailChange(token);
      success = true;
      message = "Xác thực email thành công! Email mới của bạn đã được cập nhật.";
    } catch (error) {
      message =
        error instanceof ApiError
          ? error.message
          : "Xác thực email thất bại, vui lòng thử lại.";
    }
  }

  return (
    <AuthPageShell title="Xác thực email" subtitle={success ? "Hoàn tất" : "Có lỗi xảy ra"}>
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link href="/khach-hang" className="text-sm font-medium text-primary hover:underline">
          Về trang hồ sơ của tôi
        </Link>
      </div>
    </AuthPageShell>
  );
}
