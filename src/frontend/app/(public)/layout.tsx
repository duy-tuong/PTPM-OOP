import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SmoothScrollProvider } from "@/components/shared/SmoothScrollProvider";
import { CartProvider } from "@/lib/cart/CartContext";
import { ParticleNetworkBackground } from "@/components/home/effects/ParticleNetworkBackground";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SmoothScrollProvider>
        <div className="flex min-h-screen flex-col">
          <ParticleNetworkBackground />
          <Navbar />
          <main className="flex-1 pt-24">{children}</main>
          <Footer />
        </div>
      </SmoothScrollProvider>
    </CartProvider>
  );
}
