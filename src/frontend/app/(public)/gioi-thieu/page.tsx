import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutWhatIs } from "@/components/about/AboutWhatIs";
import { AboutWhyExists } from "@/components/about/AboutWhyExists";
import { AboutTimeline } from "@/components/about/AboutTimeline";
import { AboutMissionVision } from "@/components/about/AboutMissionVision";
import { AboutValuesBento } from "@/components/about/AboutValuesBento";
import { AboutAudience } from "@/components/about/AboutAudience";
import { AboutEcosystem } from "@/components/about/AboutEcosystem";
import { AboutApproach } from "@/components/about/AboutApproach";
import { AboutPeople } from "@/components/about/AboutPeople";
import { AboutFutureDirection } from "@/components/about/AboutFutureDirection";
import { AboutClosing } from "@/components/about/AboutClosing";

export const metadata: Metadata = {
  title: "Giới thiệu Cloudverse | Hạ tầng Cloud cho thế giới số",
  description: "Khám phá Cloudverse, câu chuyện, sứ mệnh, tầm nhìn và định hướng xây dựng nền tảng hạ tầng số.",
};

// Trang "Giới thiệu" - THIẾT KẾ LẠI TOÀN BỘ, nội dung tĩnh 100% (lib/constants/about.ts), KHÔNG gọi
// backend/database/API nào - đây là trang kể câu chuyện thương hiệu (khác trang chủ/dịch vụ/bảng giá,
// vốn đã có nhiệm vụ bán sản phẩm), nội dung gần như không đổi nên không cần CMS đứng sau. Đổi nội dung
// thật của Cloudverse (timeline, câu chuyện...) thì sửa trực tiếp lib/constants/about.ts rồi deploy lại.
// Component KHÔNG async, không fetch gì - Next tự static-prerender toàn trang.
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutWhatIs />
      <AboutWhyExists />
      <AboutTimeline />
      {/* <AboutMissionVision /> */}
      <AboutValuesBento />
      {/* <AboutAudience /> */}
      {/* <AboutEcosystem /> */}
      <AboutApproach />
      <AboutPeople />
      <AboutFutureDirection />
      <AboutClosing />
    </>
  );
}
