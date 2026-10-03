import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Backend origin used by the dev-only /api rewrite. Override with BACKEND_ORIGIN.
const backendOrigin =
  process.env.BACKEND_ORIGIN?.replace(/\/+$/, "") ||
  "https://car-rental-system-be-production.up.railway.app";

const nextConfig: NextConfig = {
  // Use static export for production deployment (Cloudflare Pages)
  ...(isDev ? {} : { output: "export" }),
  images: {
    unoptimized: true,
  },
  // In local dev, proxy /api/* to live Railway backend so cookies and requests are same-origin
  ...(isDev
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: `${backendOrigin}/api/:path*`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
