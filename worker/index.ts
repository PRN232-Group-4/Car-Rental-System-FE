export interface Env {
  API_ORIGIN: string;
}

const STRIP_HEADERS = [
  "host",
  "content-length",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
];

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Chỉ chặn và proxy các đường dẫn bắt đầu bằng /api/
    if (!url.pathname.startsWith("/api/")) {
      return new Response("Not Found", { status: 404 });
    }

    const origin = (env.API_ORIGIN || "https://car-rental-system-be-production.up.railway.app").replace(/\/+$/, "");
    const target = new URL(url.pathname + url.search, origin);

    const headers = new Headers(request.headers);
    for (const h of STRIP_HEADERS) {
      headers.delete(h);
    }
    headers.set("X-Forwarded-Host", url.host);
    headers.set("X-Forwarded-Proto", url.protocol.replace(":", ""));

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 25000); // 25s timeout

    let upstream: Response;
    try {
      upstream = await fetch(target.toString(), {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
        redirect: "manual", // Bảo toàn nguyên vẹn 302 và cookie Set-Cookie
        signal: controller.signal,
      });
    } catch (err) {
      if (timedOut) {
        return new Response(
          JSON.stringify({
            type: "https://httpstatuses.com/504",
            title: "Gateway Timeout",
            status: 504,
            detail: "Yêu cầu tới upstream backend quá thời gian chờ (25 giây).",
            instance: url.pathname,
          }),
          {
            status: 504,
            statusText: "Gateway Timeout",
            headers: {
              "Content-Type": "application/problem+json; charset=utf-8",
              "Cache-Control": "no-store",
            },
          },
        );
      }
      return new Response(
        JSON.stringify({
          type: "https://httpstatuses.com/502",
          title: "Bad Gateway",
          status: 502,
          detail: `Không thể kết nối tới upstream backend: ${err instanceof Error ? err.message : String(err)}`,
          instance: url.pathname,
        }),
        {
          status: 502,
          statusText: "Bad Gateway",
          headers: {
            "Content-Type": "application/problem+json; charset=utf-8",
            "Cache-Control": "no-store",
          },
        },
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const out = new Headers();
    for (const [k, v] of upstream.headers) {
      if (k.toLowerCase() !== "set-cookie") {
        out.append(k, v);
      }
    }

    // Luôn cấm cache mọi response từ /api/*
    out.set("Cache-Control", "no-store");

    // Bảo toàn nhiều Set-Cookie headers nguyên vẹn (không ghi đè domain)
    if (typeof upstream.headers.getSetCookie === "function") {
      for (const cookie of upstream.headers.getSetCookie()) {
        out.append("set-cookie", cookie);
      }
    } else {
      const cookie = upstream.headers.get("set-cookie");
      if (cookie) {
        out.set("set-cookie", cookie);
      }
    }

    // Google OAuth: Nếu BE trả về 200/401 tại /api/auth/google/complete, chuyển hướng về /login và bảo toàn cookie
    const isGoogleStart = url.pathname === "/api/auth/google";
    const isGoogleComplete = url.pathname === "/api/auth/google/complete";

    if (isGoogleStart && upstream.status >= 400) {
      return Response.redirect(`${url.origin}/login?google=unavailable`, 302);
    }

    // Điều hướng ngược location từ nội bộ upstream BE về lại FE origin
    const location = upstream.headers.get("location");
    if (location && location.startsWith(origin + "/")) {
      out.set("location", url.origin + location.slice(origin.length));
    }

    if (isGoogleComplete && (upstream.status < 300 || upstream.status >= 400)) {
      out.delete("content-type");
      out.delete("content-length");
      out.set(
        "location",
        `${url.origin}/login?google=${upstream.status < 300 ? "ok" : "error"}`,
      );
      return new Response(null, { status: 302, headers: out });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: out,
    });
  },
};

export default worker;
