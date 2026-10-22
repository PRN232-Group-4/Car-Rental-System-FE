const reportedServers = new Set<string>();

export function apiServerInfo(url: string, frontendOrigin: string, proxyOrigin?: string) {
  const request = new URL(url, frontendOrigin);
  const proxied = request.origin === frontendOrigin && /^\/api(?:\/|$)/.test(request.pathname) && Boolean(proxyOrigin);
  return {
    requestOrigin: request.origin,
    backendOrigin: proxied ? new URL(proxyOrigin!).origin : request.origin,
    via: proxied ? "Next.js dev proxy /api" : "direct",
  };
}

/** Log each destination once. Never include query strings, bodies, cookies or headers. */
export function logApiServer(url: string): void {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return;
  try {
    const info = apiServerInfo(url, window.location.origin, process.env.NEXT_PUBLIC_DEV_API_PROXY_ORIGIN);
    const key = JSON.stringify(info);
    if (reportedServers.has(key)) return;
    reportedServers.add(key);
    console.info("[API server]", info);
  } catch {
    // Diagnostics must never change the request or its error handling.
  }
}
