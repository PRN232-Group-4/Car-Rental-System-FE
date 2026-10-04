import { ApiClient } from "./api-client";
import { mockFetch } from "./mock/mock-fetch";

describeApiClient();

async function describeApiClient() {
  function assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(`Test assertion failed: ${message}`);
    }
  }

  const client = new ApiClient({
    baseUrl: "http://localhost/api",
    customFetch: mockFetch,
  });

  // 1. Test GET /health
  {
    const data = await client.get<{ status: string }>("health");
    assert(data.status === "ok", "Client GET health should return ok");
  }

  // 2. Test GET /facilities
  {
    const facilities = await client.get<unknown[]>("facilities");
    assert(Array.isArray(facilities) && facilities.length > 0, "Client GET facilities should return array");
  }

  // 3. Test GET /vehicles with query params
  {
    const vehicles = await client.get<{ category: string }[]>("vehicles", { category: "car" });
    assert(Array.isArray(vehicles), "Client GET vehicles should return array");
    assert(vehicles.every((v) => v.category === "car"), "Filtered vehicles should be cars");
  }

  // 4. Test POST /rentals/hourly
  {
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
