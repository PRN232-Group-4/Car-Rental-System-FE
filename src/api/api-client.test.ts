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
    assert(res.success === true, "Client POST rental should return success");
    assert(Boolean(res.bookingId), "Client POST rental should have bookingId");
  }

  // 5. Unwrap the backend's standard response envelope.
  {
    const envelopeClient = new ApiClient({
      customFetch: async () =>
        new Response(
          JSON.stringify({
            message: "OK",
            is_success: true,
            data: { value: "unwrapped" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    });
    const result = await envelopeClient.get<{ value: string }>("profile");
    assert(result.value === "unwrapped", "Client should return envelope data");
  }

  // 6. Multipart uploads must let the browser set the boundary header.
  {
    let contentType: string | null = "not checked";
    const uploadClient = new ApiClient({
      customFetch: async (_input, init) => {
        contentType = new Headers(init?.headers).get("Content-Type");
        return new Response(JSON.stringify({ uploaded: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    });
    const formData = new FormData();
    formData.append("file", new Blob(["image"]), "image.png");
    await uploadClient.post("media/vehicle", formData);
    assert(contentType === null, "Multipart request should not force Content-Type");
  }
}
