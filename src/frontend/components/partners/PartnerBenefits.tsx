import { HandCoins, Megaphone, Receipt } from "@phosphor-icons/react/dist/ssr";
import { SpotlightCard } from "@/components/home/SpotlightCard";

const BENEFITS = [
  {
    icon: HandCoins,
    title: "Hoa hồng theo đơn hàng thành công",
    description: "Giới thiệu khách hàng đặt dịch vụ thành công, nhận hoa hồng tương ứng.",
  },
  {
    icon: Megaphone,
    title: "Hỗ trợ marketing & tài liệu bán hàng",
    description: "Được cung cấp nội dung, hình ảnh và thông tin dịch vụ để dễ dàng quảng bá.",
  },
  {
    icon: Receipt,
    title: "Thanh toán minh bạch, đúng hạn",
    description: "Đội ngũ Cloudverse đối soát và thanh toán hoa hồng rõ ràng cho từng đơn hàng.",
  },
];

// 3 thẻ đơn giản (không bất đối xứng như Bento của AboutValuesBento.tsx vì không có 1 con số nổi bật
// nào trung thực để làm thẻ lớn - AffiliateApplication không có field hoa hồng %/tier nào trong DB).
// Nội dung thuần định tính, không kèm số cụ thể. Style .glass-card + icon-chip hover đồng nhất với
// AboutValuesBento.tsx.
export function PartnerBenefits() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">Vì Sao Trở Thành Đối Tác</h2>
      </div>

      <div className="group/bento grid grid-cols-1 gap-4 sm:grid-cols-3">
        {BENEFITS.map((benefit) => (
          <SpotlightCard
            key={benefit.title}
            className="glass-card rounded-3xl transition-opacity duration-500 group-hover/bento:opacity-50 hover:!opacity-100"
          >
            <div className="group/card flex h-full flex-col justify-between p-6">
              <div className="w-fit rounded-lg border border-border bg-foreground/5 p-3 transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:bg-primary/10">
                <benefit.icon className="size-7 text-primary" weight="fill" />
              </div>
              <div className="mt-6">
                <h3 className="font-heading mb-2 text-lg">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
}
