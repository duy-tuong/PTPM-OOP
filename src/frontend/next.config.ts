import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendHost = process.env.API_URL
      ? process.env.API_URL.replace(/\/api\/?$/, "")
      : "http://backend:5000";
    return [
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
    ];
  },
};

export default nextConfig;
