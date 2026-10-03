import { describe, it, expect } from "vitest";
import { ApiClient } from "./api-client";
import { mockFetch } from "./mock/mock-fetch";

describe("ApiClient Unit Tests", () => {
  const client = new ApiClient({
    baseUrl: "http://localhost/api",
    customFetch: mockFetch,
  });

  it("GET /health returns status ok", async () => {
    const data = await client.get<{ status: string }>("health");
    expect(data.status).toBe("ok");
  });

  it("GET /facilities returns list of facilities", async () => {
    const facilities = await client.get<unknown[]>("facilities");
    expect(Array.isArray(facilities)).toBe(true);
    expect(facilities.length).toBeGreaterThan(0);
  });

  it("GET /vehicles with query params returns filtered items", async () => {
    const vehicles = await client.get<{ category: string }[]>("vehicles", { category: "car" });
    expect(Array.isArray(vehicles)).toBe(true);
    expect(vehicles.every((v) => v.category === "car")).toBe(true);
  });

  it("POST /rentals/hourly creates booking with id", async () => {
    const res = await client.post<{ success: boolean; bookingId?: string }>("rentals/hourly", {
      vehicleId: "v-01",
      customerName: "Tran Van B",
      customerPhone: "0987654321",
    });
    expect(res.success).toBe(true);
    expect(Boolean(res.bookingId)).toBe(true);
  });

  it("unwraps standard backend response envelope { is_success, message, data }", async () => {
    const envelopeFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ is_success: true, message: "OK", data: { id: 123, name: "Test" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    const envelopeClient = new ApiClient({ customFetch: envelopeFetch });
    const unwrapped = await envelopeClient.get<{ id: number; name: string }>("items/1");
    expect(unwrapped.id).toBe(123);
    expect(unwrapped.name).toBe("Test");
  });

  it("parses RFC 7807 ProblemDetails detail field on errors", async () => {
    const errorFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ detail: "Specific error detail from BE", status: 400 }), {
        status: 400,
        statusText: "Bad Request",
        headers: { "Content-Type": "application/json" },
      });
    const errorClient = new ApiClient({ customFetch: errorFetch });
    await expect(errorClient.get("bad-endpoint")).rejects.toThrow("Specific error detail from BE");
  });

  it("refreshes the session on 401 and retries the original request once", async () => {
    let profileCalls = 0;
    let refreshCalls = 0;
    const fetchSpy: typeof fetch = async (input) => {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/auth/refresh")) {
        refreshCalls += 1;
        return new Response(null, { status: 204 });
      }
      profileCalls += 1;
      if (profileCalls === 1) {
        return new Response(JSON.stringify({ detail: "unauthorized" }), { status: 401 });
      }
      return new Response(
        JSON.stringify({ is_success: true, data: { email: "an@thongdong.vn" } }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    };
    const authClient = new ApiClient({ baseUrl: "/api", customFetch: fetchSpy });

    const user = await authClient.get<{ email: string }>("account/profile");
    expect(user.email).toBe("an@thongdong.vn");
    expect(refreshCalls).toBe(1);
    expect(profileCalls).toBe(2);
  });

  it("gives up after a failed refresh instead of looping", async () => {
    let profileCalls = 0;
    let refreshCalls = 0;
    const fetchSpy: typeof fetch = async (input) => {
      const url =
        typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("/auth/refresh")) {
        refreshCalls += 1;
        return new Response(JSON.stringify({ detail: "no refresh token" }), { status: 401 });
      }
      profileCalls += 1;
      return new Response(JSON.stringify({ detail: "unauthorized" }), { status: 401 });
    };
    const authClient = new ApiClient({ baseUrl: "/api", customFetch: fetchSpy });

    await expect(authClient.get("account/profile")).rejects.toThrow();
    expect(refreshCalls).toBe(1);
    expect(profileCalls).toBe(1);
  });
});
