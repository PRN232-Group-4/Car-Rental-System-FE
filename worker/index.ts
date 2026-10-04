interface Env {
  API_ORIGIN: string;
}

const STRIP = [
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
    const origin = (env.API_ORIGIN || "http://localhost:5000").replace(/\/+$/, "");
    const target = new URL(url.pathname + url.search, origin);

    const headers = new Headers(request.headers);
    for (const h of STRIP) headers.delete(h);
    headers.set("X-Forwarded-Host", url.host);

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
      redirect: "manual", // Don't follow 302 so cookies and locations are preserved
    });

    const out = new Headers();
    for (const [k, v] of upstream.headers) {
      if (k.toLowerCase() !== "set-cookie") {
        out.append(k, v);
      }
    }

    // Preserve multiple Set-Cookie headers
    if (typeof upstream.headers.getSetCookie === "function") {
      for (const cookie of upstream.headers.getSetCookie()) {
        out.append("set-cookie", cookie);
      }
    } else {
      const cookie = upstream.headers.get("set-cookie");
      if (cookie) out.set("set-cookie", cookie);
    }

    // Redirect internal BE back to FE origin
    const location = upstream.headers.get("location");
    if (location && location.startsWith(origin + "/")) {
      out.set("location", url.origin + location.slice(origin.length));
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: out,
    });
  },
};

export default worker;
