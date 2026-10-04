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
