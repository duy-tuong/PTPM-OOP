// Chưa có sidebar/topbar/role-gating ở đây - sẽ dựng ở Phase 6.6. Route protection (redirect về
// /admin/login khi chưa đăng nhập) sẽ nằm ở proxy.ts, dựng ở Phase 6.5.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-full">{children}</div>;
}
