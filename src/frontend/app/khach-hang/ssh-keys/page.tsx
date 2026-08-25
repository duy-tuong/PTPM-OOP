import { redirect } from "next/navigation";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import { getMySshKeys } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { SshKeysManager } from "@/components/account/SshKeysManager";

export const metadata = { title: "SSH Key" };

// Đợt 3, Phần 12 - danh sách SSH Key lưu theo tài khoản, tái sử dụng qua nhiều đơn mua VPS khác nhau.
export default async function SshKeysPage() {
  const token = await getCustomerAccessToken();
  if (!token) {
    redirect("/login");
  }

  let keys;
  try {
    keys = await getMySshKeys(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }

  return <SshKeysManager initialKeys={keys} />;
}
