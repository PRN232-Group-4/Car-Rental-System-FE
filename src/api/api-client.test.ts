import { describe, it, expect } from "vitest";
import { ApiClient, ApiClientError } from "./api-client";
import { mockFetch } from "./mock/mock-fetch";

it("preserves nested ProblemDetails from the deployed envelope for inline validation", () => {
  const error = new ApiClientError(400, "Bad Request", { is_success: false, error: { errors: { "request.EndTime": ["Giờ trả xe không hợp lệ."] }, detail: "Thông tin chưa hợp lệ." } });
  expect(error.data).toMatchObject({ errors: { "request.EndTime": ["Giờ trả xe không hợp lệ."] } });
  expect(error.message).toContain("Giờ trả xe không hợp lệ.");
});

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

  it("unwraps the backend response envelope", async () => {
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
    expect(result.value).toBe("unwrapped");
  });

  it("keeps multipart uploads browser-controlled", async () => {
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

    expect(contentType).toBeNull();
  });
});

it("reports request timeouts without exposing the raw abort error", async () => {
  const client = new ApiClient({
    timeout: 5,
    customFetch: (_url, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("signal is aborted without reason", "AbortError")), { once: true });
    }),
  });
  await expect(client.get("dashboard")).rejects.toMatchObject({ status: 408, message: expect.stringContaining("dashboard") });
});

it("preserves non-timeout network failures", async () => {
  const failure = new TypeError("Failed to fetch");
  const client = new ApiClient({ customFetch: async () => { throw failure; } });
  await expect(client.get("dashboard")).rejects.toBe(failure);
});

it("extracts field errors from ASP.NET Core ValidationProblemDetails", async () => {
  const client = new ApiClient({
    customFetch: async () =>
      new Response(
        JSON.stringify({
          type: "https://tools.ietf.org/html/rfc9110#section-15.5.1",
          title: "One or more validation errors occurred.",
          status: 400,
          errors: {
            StaffRole: ["The field StaffRole must match the regular expression '^(CustomerService|Driver|Maintenance)$'."],
            license: ["Tài xế phải có ngày hết hạn giấy phép."],
          },
        }),
        { status: 400, statusText: "Bad Request", headers: { "Content-Type": "application/json" } },
      ),
  });

  await expect(client.post("staff", {})).rejects.toMatchObject({
    status: 400,
    message: expect.stringContaining("StaffRole: The field StaffRole must match"),
  });
});

it("reads the ProblemDetails BE wraps under ApiResponse.error", async () => {
  const client = new ApiClient({
    customFetch: async () =>
      new Response(
        JSON.stringify({
          code: 400,
          status: "error",
          is_success: false,
          data: null,
          message: "One or more validation errors occurred.",
          error: { status: 400, title: "One or more validation errors occurred.", errors: { StartTime: ["Thời gian nhận xe phải ở tương lai."] } },
        }),
        { status: 400, statusText: "Bad Request", headers: { "Content-Type": "application/json" } },
      ),
  });

  await expect(client.post("rentals/hourly", {})).rejects.toMatchObject({
    status: 400,
    message: expect.stringContaining("StartTime: Thời gian nhận xe phải ở tương lai."),
  });
});

it("falls back to the ApiResponse.message when error has no detail", async () => {
  const client = new ApiClient({
    customFetch: async () =>
      new Response(
        JSON.stringify({ code: 403, status: "error", is_success: false, data: null, message: "Gói thuê bao không đủ số giờ còn lại.", error: { status: 403, title: "Forbidden" } }),
        { status: 403, statusText: "Forbidden", headers: { "Content-Type": "application/json" } },
      ),
  });

  await expect(client.post("rentals/hourly", {})).rejects.toMatchObject({
    status: 403,
    message: "Gói thuê bao không đủ số giờ còn lại.",
  });
});
