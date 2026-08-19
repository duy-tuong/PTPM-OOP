import type { ReactNode } from "react";
import { getAdminSession } from "@/lib/auth/adminSession";
import { AccessDenied } from "@/components/admin/AccessDenied";

// Bọc chung cho cả 3 route con (list/new/[id]/edit) - GET|POST|PUT|DELETE /admin/service-plans chỉ
// [Authorize(Roles="Admin")], chặn 1 lần ở đây thay vì lặp guard trong từng page.tsx.
export default async function AdminServicePlansLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  if (!session?.roles.includes("Admin")) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
