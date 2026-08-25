import { getPartners } from "@/lib/api/content";
import { safeFetch } from "@/lib/api/safe";
import { FallbackImage } from "@/components/shared/FallbackImage";
import { Marquee } from "@/components/shared/Marquee";
import type { PartnerDto } from "@/lib/types/content";
import { Hexagon, Globe, Cloud, Database, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

const DUMMY_PARTNERS = [
  { id: "d1", name: "Acme Corp", icon: <Hexagon weight="fill" className="size-6" /> },
  { id: "d2", name: "GlobalTech", icon: <Globe weight="fill" className="size-6" /> },
  { id: "d3", name: "Nexis Cloud", icon: <Cloud weight="fill" className="size-6" /> },
  { id: "d4", name: "DataFlow", icon: <Database weight="fill" className="size-6" /> },
  { id: "d5", name: "SecureNet", icon: <ShieldCheck weight="fill" className="size-6" /> },
  { id: "d6", name: "Synapse", icon: <Hexagon weight="fill" className="size-6" /> },
];

// Section 2/9 của Trang chủ (pivot 2 - theme "Cloudverse"). 
// Bổ sung Metrics theo chuẩn B2B SaaS.
export async function TrustStrip() {
  const partners = await safeFetch(() => getPartners({ revalidate: 3600 }), []);
  
  const hasRealPartners = partners.length > 0;
  const shouldMarquee = hasRealPartners ? partners.length > 1 : true;

  return (
    <section className="border-y border-border/50 bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Metrics Grid */}
        <div className="mb-20 grid grid-cols-2 gap-y-12 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border/50">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl mb-2">99.9%</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uptime Server</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl mb-2">24/7</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Technical Support</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl mb-2">5 phút</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Triển khai</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-4">
            <span className="text-3xl font-extrabold text-foreground sm:text-4xl mb-2">99.99%</span>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Network Availability</span>
          </div>
        </div>

        {/* Partners */}
        <p className="mb-10 text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Được tin dùng bởi các doanh nghiệp trên khắp Việt Nam
        </p>

        {shouldMarquee ? (
          <Marquee>
            {hasRealPartners
              ? partners.map((partner) => (
                  <PartnerLogo key={partner.id} partner={partner} />
                ))
              : DUMMY_PARTNERS.map((partner) => (
                  <DummyPartnerLogo key={partner.id} partner={partner} />
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

function DummyPartnerLogo({ partner }: { partner: { name: string; icon: React.ReactNode } }) {
  return (
    <div className="flex items-center gap-2 px-12 text-muted-foreground/40 grayscale transition-all duration-300 hover:text-foreground/70 hover:grayscale-0 cursor-default">
      {partner.icon}
      <span className="text-xl font-bold tracking-tight">{partner.name}</span>
    </div>
  );
}
