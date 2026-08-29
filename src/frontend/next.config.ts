import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendHost = process.env.API_URL
      ? process.env.API_URL.replace(/\/api\/?$/, "")
      : "http://backend:5000";
    // BUG THẬT phát hiện Đợt 13 (Phần 1, A2) - return 1 mảng trần bị Next.js coi là rewrite `afterFiles`,
    // được kiểm tra SAU route tĩnh nhưng TRƯỚC route ĐỘNG của chính Next.js (app/api/**/[param]/route.ts).
    // Hệ quả: mọi Route Handler có segment động dưới các path liệt kê dưới đây (vd
    // order-requests/[id]/cancel, order-requests/items/[itemId]/change-plan) bị rewrite này "nuốt mất" -
    // request đi thẳng ra backend qua network, KHÔNG qua Route Handler nên KHÔNG được đính kèm
    // Authorization header từ cookie httpOnly -> backend luôn trả 401 dù cookie đăng nhập vẫn hợp lệ.
    // Đã verify trực tiếp bằng curl: response có header `server: Kestrel` (backend .NET) thay vì đi qua
    // Next.js - tính năng "Đổi gói" (items/[itemId]/change-plan) đã bị lỗi này từ trước, không phải lỗi
    // mới phát sinh. Fix: bọc trong `fallback` thay vì trả mảng trần - `fallback` chỉ được kiểm tra SAU
    // CẢ route tĩnh lẫn route động của Next.js, đúng ý định ban đầu "chỉ rewrite khi không có Route
    // Handler nào khớp" (comment cũ trong lịch sử dự án nói đang dùng afterFiles cho mục đích này -
    // thực ra afterFiles không đạt được điều đó với route động, chỉ fallback mới đúng).
    return {
      fallback: [
        {
          source: "/uploads/:path*",
          destination: `${backendHost}/uploads/:path*`,
        },
        {
          source: "/api/service-categories/:path*",
          destination: `${backendHost}/api/service-categories/:path*`,
        },
        {
          source: "/api/service-plans/:path*",
          destination: `${backendHost}/api/service-plans/:path*`,
        },
        {
          source: "/api/tld-pricing/:path*",
          destination: `${backendHost}/api/tld-pricing/:path*`,
        },
        {
          source: "/api/promotions/:path*",
          destination: `${backendHost}/api/promotions/:path*`,
        },
        {
          source: "/api/regions/:path*",
          destination: `${backendHost}/api/regions/:path*`,
        },
        {
          source: "/api/order-requests/:path*",
          destination: `${backendHost}/api/order-requests/:path*`,
        },
        {
          source: "/api/consultation-requests/:path*",
          destination: `${backendHost}/api/consultation-requests/:path*`,
        },
        {
          source: "/api/affiliate-applications/:path*",
          destination: `${backendHost}/api/affiliate-applications/:path*`,
        },
        {
          source: "/api/news-articles/:path*",
          destination: `${backendHost}/api/news-articles/:path*`,
        },
        {
          source: "/api/news-categories/:path*",
          destination: `${backendHost}/api/news-categories/:path*`,
        },
        {
          source: "/api/testimonials/:path*",
          destination: `${backendHost}/api/testimonials/:path*`,
        },
        {
          source: "/api/partners/:path*",
          destination: `${backendHost}/api/partners/:path*`,
        },
        {
          source: "/api/faqs/:path*",
          destination: `${backendHost}/api/faqs/:path*`,
        },
        {
          source: "/api/addons/:path*",
          destination: `${backendHost}/api/addons/:path*`,
        },
        {
          source: "/api/vouchers/:path*",
          destination: `${backendHost}/api/vouchers/:path*`,
        },
        {
          source: "/api/payments/:path*",
          destination: `${backendHost}/api/payments/:path*`,
        },
        {
          source: "/api/dashboard/:path*",
          destination: `${backendHost}/api/dashboard/:path*`,
        },
      ],
    };
  },
};


export default nextConfig;



