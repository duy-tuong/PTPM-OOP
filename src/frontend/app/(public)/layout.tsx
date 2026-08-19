import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { SmoothScrollProvider } from "@/components/shared/SmoothScrollProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="flex min-h-full flex-1 flex-col">
        <Navbar />
        <main className="flex-1 pt-24">{children}</main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
