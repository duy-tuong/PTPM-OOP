import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SmoothScrollProvider } from "@/components/shared/SmoothScrollProvider";
import { CartProvider } from "@/lib/cart/CartContext";
import { ParticleNetworkBackground } from "@/components/home/effects/ParticleNetworkBackground";
import { CursorTrail } from "@/components/home/effects/CursorTrail";
import { BackToTopButton } from "@/components/shared/BackToTopButton";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SmoothScrollProvider>
        <div className="flex min-h-screen flex-col">
          <ParticleNetworkBackground />
          <CursorTrail />
          <Navbar />
          <main className="flex-1 pt-24">{children}</main>
          <Footer />
          <BackToTopButton />
        </div>
      </SmoothScrollProvider>
    </CartProvider>
  );
}
