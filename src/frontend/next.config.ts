import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const backendHost = process.env.API_URL
      ? process.env.API_URL.replace(/\/api\/?$/, "")
      : "http://backend:5000";
    return {
      beforeFiles: [],
      afterFiles: [
        {
          source: "/uploads/:path*",
          destination: `${backendHost}/uploads/:path*`,
        },
        {
          source: "/api/:path*",
          destination: `${backendHost}/api/:path*`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
