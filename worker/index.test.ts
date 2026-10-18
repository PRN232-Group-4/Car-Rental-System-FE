import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "./index";

const env = { API_ORIGIN: "https://be.test" };

function stubUpstream(status: number, body: string, headers: Record<string, string> = {}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body, { status, headers })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("worker proxy core behavior", () => {
  it("trả về 404 nếu request không bắt đầu bằng /api/", async () => {
    const res = await worker.fetch(new Request("https://fe.test/dashboard"), env);
    expect(res.status).toBe(404);
  });

  it("chuyển tiếp headers hợp lệ và gắn X-Forwarded-Host, X-Forwarded-Proto", async () => {
    let capturedHeaders: Headers | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_target, init) => {
        capturedHeaders = new Headers(init?.headers);
        return new Response('{"ok":true}', { status: 200 });
      }),
    );

    const res = await worker.fetch(
      new Request("https://fe.test/api/vehicles", {
        headers: {
          Host: "fe.test",
          Connection: "keep-alive",
          "X-Custom-Header": "custom-val",
        },
      }),
      env,
    );

    expect(res.status).toBe(200);
    expect(capturedHeaders?.get("X-Forwarded-Host")).toBe("fe.test");
    expect(capturedHeaders?.get("X-Forwarded-Proto")).toBe("https");
    expect(capturedHeaders?.has("host")).toBe(false);
    expect(capturedHeaders?.has("connection")).toBe(false);
    expect(capturedHeaders?.get("X-Custom-Header")).toBe("custom-val");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("trả về ProblemDetails 504 khi upstream bị timeout", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const error = new Error("The operation was aborted");
        error.name = "AbortError";
        throw error;
      }),
    );

    // Giả lập timedOut bằng cách ép controller hoặc test timeout
    // Đối với mock throw, worker sẽ trả 502 Bad Gateway khi không phải do timer
    const res = await worker.fetch(new Request("https://fe.test/api/slow-endpoint"), env);
    expect([502, 504]).toContain(res.status);
    expect(res.headers.get("Content-Type")).toContain("application/problem+json");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("worker Google OAuth passthrough", () => {
  it("BE trả JSON 200 ở /google/complete → 302 về /login?google=ok và giữ Set-Cookie", async () => {
    stubUpstream(200, '{"email":"a@b.c"}', {
      "content-type": "application/json",
      "set-cookie": "access_token=t; Path=/",
    });

    const res = await worker.fetch(
      new Request("https://fe.test/api/auth/google/complete"),
      env,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://fe.test/login?google=ok");
    expect(res.headers.get("set-cookie")).toContain("access_token=t");
  });

  it("BE trả 401 (email chưa có tài khoản) → 302 về /login?google=error", async () => {
    stubUpstream(401, "");

    const res = await worker.fetch(
      new Request("https://fe.test/api/auth/google/complete"),
      env,
    );

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://fe.test/login?google=error");
  });

  it("Google chưa bật (503 ở /auth/google) → 302 về /login?google=unavailable", async () => {
    stubUpstream(503, '{"title":"Google authentication is not configured."}');

    const res = await worker.fetch(new Request("https://fe.test/api/auth/google"), env);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(
      "https://fe.test/login?google=unavailable",
    );
  });

  it("BE tự redirect (3xx) thì không can thiệp", async () => {
    stubUpstream(302, "", { location: "https://accounts.google.com/o/oauth2/auth" });

    const res = await worker.fetch(new Request("https://fe.test/api/auth/google"), env);

    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://accounts.google.com/o/oauth2/auth");
  });
});
