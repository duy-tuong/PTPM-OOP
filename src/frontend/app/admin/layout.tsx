import { getAdminSession } from "@/lib/auth/adminSession";
import { AdminShell } from "@/components/admin/AdminShell";

// Sidebar+Topbar thật (Phase 6.6, thay thanh session tối giản trước đó). Không render AdminShell khi
// không có session (route /admin/login) - trang đó tự render layout căn giữa riêng, không cần
// Sidebar/Topbar bao quanh.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return <>{children}</>;
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
