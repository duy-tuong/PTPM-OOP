import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/api/config";
import { getAdminUsers } from "@/lib/api/admin/users";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuthCookies";
import { UsersManager } from "@/components/admin/users/UsersManager";

export const metadata: Metadata = {
  title: "Quản lý nhân viên",
};

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
  const baseUrl = getApiUrl();

  const users = await getAdminUsers(baseUrl, token);

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <UsersManager users={users} />
      </div>
    </div>
  );
}
