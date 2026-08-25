import { ShieldCheck, RocketLaunch, Clock, Headset } from "@phosphor-icons/react/dist/ssr";
import { ScrollReveal } from "@/components/home/ScrollReveal";

const FEATURES = [
  {
    title: "99.9% Uptime",
    description: "Hạ tầng ổn định và giám sát liên tục.",
    icon: <Clock weight="fill" className="size-6" />,
  },
  {
    title: "Triển khai nhanh",
    description: "Khởi tạo VPS và dịch vụ chỉ trong vài phút.",
    icon: <RocketLaunch weight="fill" className="size-6" />,
  },
  {
    title: "Bảo mật nhiều lớp",
    description: "Firewall, SSL và DDoS Protection.",
    icon: <ShieldCheck weight="fill" className="size-6" />,
  },
  {
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ kỹ thuật sẵn sàng hỗ trợ.",
    icon: <Headset weight="fill" className="size-6" />,
  }
];

export function FeaturesSection() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-12 text-center sm:mb-16">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            Tại sao doanh nghiệp chọn Cloudverse?
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
          {FEATURES.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="group relative flex flex-col gap-4 rounded-[20px] border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-md sm:flex-row sm:items-center sm:p-8">
                <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-muted/60 transition-colors duration-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20">
                  <span className="text-foreground transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {feature.icon}
                  </span>
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-bold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground sm:text-base">{feature.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
