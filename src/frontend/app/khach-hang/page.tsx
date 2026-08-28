import { redirect } from "next/navigation";
import Link from "next/link";
import { getCustomerAccessToken } from "@/lib/auth/customerSession";
import { getMyProfile, getMyOrders, getMyServices, getMyConsultationRequests } from "@/lib/api/customer";
import { ApiError } from "@/lib/api/http";
import { ProfileForm } from "@/components/account/ProfileForm";
import { HardDrives, Receipt, Headset } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Tổng quan tài khoản" };

async function loadData(token: string) {
  try {
    const [profile, orders, services, consultations] = await Promise.all([
      getMyProfile(token),
      getMyOrders({ pageNumber: 1, pageSize: 1 }, token),
      getMyServices({ pageNumber: 1, pageSize: 1 }, token),
      getMyConsultationRequests({ pageNumber: 1, pageSize: 1 }, token),
    ]);
    
    return {
      profile,
      stats: {
        orders: orders.totalCount,
        services: services.totalCount,
        consultations: consultations.totalCount,
      }
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }
    throw error;
  }
}

export default async function AccountOverviewPage() {
  const token = await getCustomerAccessToken();
  if (!token) {
    redirect("/login");
  }

  const { profile, stats } = await loadData(token);

  return (
    <div className="flex flex-col gap-10">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-foreground">Tổng quan</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Dịch vụ đang chạy */}
        <Link href="/khach-hang/dich-vu" className="block group">
          <Card className="h-full bg-card border-border/60 shadow-sm group-hover:border-primary/30 transition-all duration-200">
            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
              <div className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Dịch vụ đang chạy</div>
              <HardDrives className="size-5 text-primary/70" />
            </CardHeader>
            <CardContent>
              <div className="text-[32px] font-bold text-foreground leading-none mb-3">{stats.services}</div>
              <div className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Đang hoạt động
              </div>
            </CardContent>
          </Card>
        </Link>
        
        {/* Tổng đơn hàng */}
        <Link href="/khach-hang/don-hang" className="block group">
          <Card className="h-full bg-card border-border/60 shadow-sm group-hover:border-slate-400/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
              <div className="text-sm font-medium text-muted-foreground transition-colors">Tổng đơn hàng</div>
              <Receipt className="size-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-[32px] font-bold text-foreground leading-none mb-3">{stats.orders}</div>
              <div className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Tất cả đơn hàng
              </div>
            </CardContent>
          </Card>
        </Link>
        
        {/* Yêu cầu tư vấn */}
        <Link href="/khach-hang/yeu-cau-tu-van" className="block group">
          <Card className="h-full bg-card border-border/60 shadow-sm group-hover:border-slate-400/50 transition-all duration-200">
            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
              <div className="text-sm font-medium text-muted-foreground transition-colors">Yêu cầu tư vấn</div>
              <Headset className="size-5 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-[32px] font-bold text-foreground leading-none mb-3">{stats.consultations}</div>
              <div className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Đang chờ xử lý
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
