import { getPartners } from "@/lib/api/content";
import { safeFetch } from "@/lib/api/safe";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { Marquee } from "@/components/shared/Marquee";
import type { PartnerDto } from "@/lib/types/content";

// Section 2/9 của Trang chủ (pivot 2 - theme "Cloudverse"). Dữ liệu thật từ getPartners() - marquee
// (component dùng chung `Marquee`) là bố cục mặc định (chạy ngang liên tục vô tận) theo đúng thiết kế
// Stitch tham khảo, chỉ tắt khi có đúng 1 đối tác (nhân đôi 1 logo để chạy marquee không có ý nghĩa).
// Bọc safeFetch: backend gián đoạn thì ẩn section thay vì sập cả trang.
export async function TrustStrip() {
  const partners = await safeFetch(() => getPartners({ revalidate: 3600 }), []);

  if (partners.length === 0) {
    return null;
  }

  const shouldMarquee = partners.length > 1;

  return (
    <section className="border-y border-border bg-muted/30 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Được tin dùng bởi các đối tác của chúng tôi
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
      </div>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: PartnerDto }) {
  const image = (
    <FallbackImage
      src={partner.logoUrl}
      alt={partner.name}
      className="h-8 w-auto grayscale opacity-40 transition-all duration-300 hover:opacity-100 hover:grayscale-0"
      fallbackClassName="flex h-8 min-w-16 items-center justify-center rounded-md border border-border px-3 text-xs font-semibold text-muted-foreground"
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
