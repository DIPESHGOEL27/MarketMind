import type { NextConfig } from "next";

const API_BACKEND = process.env.API_BACKEND_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone", // Enables optimized Docker builds
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND}/api/:path*`,
      },
      {
        source: "/ws/:path*",
        destination: `${API_BACKEND}/ws/:path*`,
      },
    ];
  },
};

export default nextConfig;
