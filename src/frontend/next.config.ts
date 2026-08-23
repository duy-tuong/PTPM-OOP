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
    ];
  },
};

export default nextConfig;
