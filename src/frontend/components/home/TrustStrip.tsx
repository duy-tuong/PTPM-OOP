import { getPartners } from "@/lib/api/content";
import { safeFetch } from "@/lib/api/safe";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { Marquee } from "@/components/shared/Marquee";
import type { PartnerDto } from "@/lib/types/content";
import { AnimatedNumber } from "@/components/shared/AnimatedNumber";

// Section 2/9 của Trang chủ (pivot 2 - theme "Cloudverse").
// Bổ sung Metrics theo chuẩn B2B SaaS.
export async function TrustStrip() {
  const partners = await safeFetch(() => getPartners({ revalidate: 3600 }), []);

  // Trước đây có DUMMY_PARTNERS (6 công ty bịa: Acme Corp, GlobalTech...) hiện ra khi getPartners() trả
  // rỗng - khách thật thấy "đối tác" hoàn toàn giả. Đã bỏ - đúng nguyên tắc không bịa dữ liệu nghiệp vụ,
  // mirror cách TestimonialsGridSection.tsx đang xử lý (return null khi rỗng thay vì fallback giả).
  const hasRealPartners = partners.length > 0;
  const shouldMarquee = partners.length > 1;

  return (
    <section className="border-y border-border/50 bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Metrics Grid */}
        <div className="mb-12 grid grid-cols-2 gap-y-12 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border/50">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl mb-2"><AnimatedNumber value={99.9} decimals={1} />%</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uptime Server</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl mb-2"><AnimatedNumber value={24} />/7</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Technical Support</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl mb-2"><AnimatedNumber value={5} /> phút</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Triển khai</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl mb-2"><AnimatedNumber value={99.99} decimals={2} />%</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Network Availability</span>
          </div>
        </div>

        {/* Partners - tự ẩn hẳn khối này (kể cả tiêu đề) khi chưa có Đối tác thật, không còn fallback giả. */}
        {hasRealPartners && (
          <>
            <p className="mb-10 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Được tin dùng bởi các doanh nghiệp trên khắp Việt Nam
            </p>

            {shouldMarquee ? (
              <Marquee>
                {partners.map((partner) => (
                  <PartnerLogo key={partner.id} partner={partner} />
                ))}
              </Marquee>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                {partners.map((partner) => (
                  <PartnerLogo key={partner.id} partner={partner} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: PartnerDto }) {
  const image = (
    <FallbackImage
      src={partner.logoUrl}
      alt={partner.name}
      className="h-8 w-auto grayscale opacity-40 transition-all duration-300 hover:opacity-100 hover:grayscale-0 mx-8"
      fallbackClassName="flex h-8 min-w-16 items-center justify-center rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground mx-8"
    />
  );

  return partner.websiteUrl ? (
    <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={partner.name}>
      {image}
    </a>
  ) : (
    image
  );
}
