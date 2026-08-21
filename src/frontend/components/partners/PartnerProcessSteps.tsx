import { ClipboardText, Envelope, Hourglass } from "@phosphor-icons/react/dist/ssr";

const STEPS = [
  {
    icon: ClipboardText,
    title: "Điền form đăng ký",
    description: "Cung cấp thông tin liên hệ và kế hoạch quảng bá dự kiến của bạn.",
  },
  {
    icon: Hourglass,
    title: "Đội ngũ Cloudverse xét duyệt",
    description: "Đơn đăng ký được xem xét dựa trên thông tin bạn cung cấp.",
  },
  {
    icon: Envelope,
    title: "Nhận phản hồi qua email",
    description: "Cloudverse liên hệ lại với kết quả xét duyệt và bước tiếp theo.",
  },
];

// 3 bước mô tả đúng pipeline AffiliateApplicationStatus thật (Pending -> Approved/Rejected,
// Domain/Enums/AffiliateApplicationStatus.cs) - không hứa hẹn thời gian xử lý cụ thể vì backend không
// định nghĩa SLA nào (tránh bịa "trong vòng 24h").
export function PartnerProcessSteps() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold text-balance sm:text-4xl">Quy Trình Đăng Ký</h2>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex flex-col items-center gap-3 text-center">
            <div className="relative flex size-14 items-center justify-center rounded-full border border-border bg-muted">
              <step.icon className="size-6 text-primary" weight="fill" />
              <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {index + 1}
              </span>
            </div>
            <h3 className="font-heading text-lg">{step.title}</h3>
            <p className="max-w-[240px] text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
