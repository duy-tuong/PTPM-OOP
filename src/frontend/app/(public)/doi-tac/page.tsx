import type { Metadata } from "next";
import { PartnerHero } from "@/components/partners/PartnerHero";
import { PartnerBenefits } from "@/components/partners/PartnerBenefits";
import { PartnerProcessSteps } from "@/components/partners/PartnerProcessSteps";
import { PartnerApplicationForm } from "@/components/partners/PartnerApplicationForm";

export const metadata: Metadata = {
  title: "Đối tác",
  description: "Đăng ký trở thành đối tác affiliate của Cloudverse - giới thiệu khách hàng, nhận hoa hồng cho mỗi đơn hàng thành công.",
};

// Trang tĩnh - không có ContentPage nào seed cho slug "doi-tac" (khác /gioi-thieu), không cần
// Promise.all/safeFetch nào ở đây ngoài phần form là client-side (PartnerApplicationForm.tsx).
export default function PartnersPage() {
  return (
    <>
      <PartnerHero />
      <PartnerBenefits />
      <PartnerProcessSteps />
      <PartnerApplicationForm />
    </>
  );
}
