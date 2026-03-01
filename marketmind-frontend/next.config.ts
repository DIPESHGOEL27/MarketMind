import type { NextConfig } from "next";

const API_BACKEND = process.env.API_BACKEND_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  // "standalone" is for Docker only — Vercel ignores/overrides this automatically
  ...(process.env.DOCKER === "true" ? { output: "standalone" as const } : {}),
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
