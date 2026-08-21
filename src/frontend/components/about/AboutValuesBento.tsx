import { CurrencyCircleDollar, HardDrives, Headset, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { SpotlightCard } from "@/components/home/SpotlightCard";

const VALUES = [
  {
    icon: Headset,
    title: "Hỗ trợ tận tâm",
    description: "Đội ngũ kỹ thuật đồng hành 24/7, phản hồi nhanh mọi yêu cầu hỗ trợ.",
  },
  {
    icon: CurrencyCircleDollar,
    title: "Minh bạch chi phí",
    description: "Bảng giá rõ ràng, không phụ phí ẩn, dễ dàng so sánh trước khi đặt dịch vụ.",
  },
  {
    icon: ShieldCheck,
    title: "Bảo mật hàng đầu",
    description: "Firewall chống DDoS, SSL và các lớp bảo vệ hạ tầng theo tiêu chuẩn ngành.",
  },
];

// Bento bất đối xứng cho nội dung tĩnh (không có bảng thống kê nào trong DB) - thẻ lớn nhắc lại đúng
// dòng "99.9% uptime" đã dùng ở HeroSection.tsx (số duy nhất có tiền lệ trong dự án), KHÔNG bịa thêm số
// khách hàng/server/năm kinh nghiệm nào khác. Style .glass-card đồng nhất cho cả 4 thẻ - giống hệt
// ServicesBentoSection.tsx (thẻ hero và thẻ thường dùng chung 1 style), tránh trộn thêm biến thể nền
// solid gây lệch trong cùng 1 lưới. Hiệu ứng hover (group/bento dim toàn lưới + group/card icon nhích
// lên) tái dùng đúng convention đã có, không thêm box-shadow rời.
export function AboutValuesBento() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">Sứ Mệnh &amp; Giá Trị Cốt Lõi</h2>
      </div>

      <div className="group/bento grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[190px]">
        <SpotlightCard className="glass-card relative overflow-hidden rounded-3xl transition-opacity duration-500 group-hover/bento:opacity-50 hover:!opacity-100 sm:col-span-2 lg:row-span-2">
          <div className="group/card relative flex h-full flex-col justify-between p-8">
            <span
              aria-hidden
              className="font-heading pointer-events-none absolute right-2 bottom-0 text-[8rem] leading-none font-bold text-foreground/5 select-none lg:text-[10rem]"
            >
              99.9%
            </span>
            <div className="relative w-fit rounded-lg border border-border bg-foreground/5 p-4 transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:bg-primary/10">
              <HardDrives className="size-9 text-primary" weight="fill" />
            </div>
            <div className="relative mt-6">
              <h3 className="font-heading mb-2 text-2xl">Hạ tầng ổn định</h3>
              <p className="text-base text-muted-foreground">
                Cam kết uptime 99.9%, giám sát hạ tầng liên tục để dịch vụ luôn sẵn sàng.
              </p>
            </div>
          </div>
        </SpotlightCard>

        {VALUES.map((value) => (
          <SpotlightCard
            key={value.title}
            className="glass-card rounded-3xl transition-opacity duration-500 group-hover/bento:opacity-50 hover:!opacity-100"
          >
            <div className="group/card flex h-full flex-col justify-between p-6">
              <div className="w-fit rounded-lg border border-border bg-foreground/5 p-3 transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:bg-primary/10">
                <value.icon className="size-7 text-primary" weight="fill" />
              </div>
              <div className="mt-6">
                <h3 className="font-heading mb-2 text-lg">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
