import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Backend origin used by dev-only /api rewrite. Override with DEV_API_ORIGIN or BACKEND_ORIGIN.
const backendOrigin =
  process.env.DEV_API_ORIGIN?.replace(/\/+$/, "") ||
  process.env.BACKEND_ORIGIN?.replace(/\/+$/, "") ||
  "https://car-rental-system-be-production.up.railway.app";

// Only expose the public server origin for diagnostics, never credentials/query values.
const backendLogOrigin = (() => {
  try { return new URL(backendOrigin).origin; }
  catch { return ""; }
})();

let hasLoggedProxy = false;

const nextConfig: NextConfig = {
  // Use static export for production deployment (Cloudflare Pages)
  ...(isDev ? {} : { output: "export" }),
  images: {
    unoptimized: true,
  },
  // In local dev, proxy /api/* to live Railway backend so cookies and requests are same-origin
  ...(isDev
    ? {
        env: { NEXT_PUBLIC_DEV_API_PROXY_ORIGIN: backendLogOrigin },
        async rewrites() {
          // Next calls this for both routing and route types using the same config.
          if (!hasLoggedProxy) {
            hasLoggedProxy = true;
            console.info(`[API proxy] /api/* -> ${backendLogOrigin || "(URL không hợp lệ)"} · ${process.env.DEV_API_ORIGIN ? "DEV_API_ORIGIN" : process.env.BACKEND_ORIGIN ? "BACKEND_ORIGIN" : "Railway mặc định"}`);
          }
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
