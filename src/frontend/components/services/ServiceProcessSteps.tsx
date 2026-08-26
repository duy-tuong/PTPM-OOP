import { ScrollReveal } from "@/components/home/ScrollReveal";

const STEPS = [
  { title: "Chọn dịch vụ", description: "Duyệt danh mục và chọn dịch vụ phù hợp với nhu cầu." },
  { title: "Chọn cấu hình", description: "Chọn gói có sẵn hoặc tuỳ chỉnh cấu hình theo nhu cầu thực tế." },
  { title: "Thanh toán", description: "Xác nhận đơn hàng và thanh toán qua cổng bảo mật." },
  { title: "Kích hoạt", description: "Dịch vụ được bàn giao và sẵn sàng sử dụng." },
];

// Hướng dẫn UI tĩnh (4 bước) - không gắn với trạng thái đơn hàng thật nào, chỉ mô tả luồng chung của
// luồng mua hàng hiện có (đặt hàng -> thanh toán -> OrderAutoProvisioningBackgroundService kích hoạt).
// Được phép hardcode theo đúng ràng buộc "content marketing/hướng dẫn tĩnh" của brief.
export function ServiceProcessSteps() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrollReveal className="mb-12 flex flex-col gap-3 text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">Triển khai dịch vụ chỉ với 4 bước</h2>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, index) => (
          <ScrollReveal key={step.title} delay={index * 0.08}>
            <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6">
              <span className="font-heading text-3xl font-bold text-primary/40">0{index + 1}</span>
              <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
