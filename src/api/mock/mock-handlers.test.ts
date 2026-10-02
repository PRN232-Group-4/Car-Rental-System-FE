import { handleMockRoute } from "./mock-handlers";
import { mockStore } from "./mock-store";

describeMockHandlers();

function describeMockHandlers() {
  function assert(condition: boolean, message: string) {
    if (!condition) {
      throw new Error(`Test assertion failed: ${message}`);
    }
  }

  // 1. Health check test
  {
    const res = handleMockRoute("GET", "http://localhost/api/health");
    assert(res.status === 200, "Health status should be 200");
    assert((res.data as { status: string }).status === "ok", "Health status payload should be ok");
  }

  // 2. Facilities test
  {
    const res = handleMockRoute("GET", "http://localhost/api/facilities");
    assert(res.status === 200, "Facilities status should be 200");
    assert(Array.isArray(res.data) && res.data.length > 0, "Facilities should return a non-empty array");
  }

  // 3. Vehicles with query parameters test
  {
    const res = handleMockRoute("GET", "http://localhost/api/vehicles?category=electric_car");
    assert(res.status === 200, "Vehicles query status should be 200");
    assert(
      (res.data as { category: string }[]).every((v) => v.category === "electric_car"),
      "All returned vehicles should match electric_car category"
    );
  }

  // 4. Subscription plans test
  {
    const res = handleMockRoute("GET", "http://localhost/api/subscription-plans");
    assert(res.status === 200, "Subscription plans status should be 200");
    assert(Array.isArray(res.data), "Subscription plans should be an array");
  }

  // 5. Rentals booking test
  {
    mockStore.reset();
    const payload = {
      vehicleId: "v-01",
      customerName: "Nguyen Van A",
      customerPhone: "0901234567",
      startTime: "2026-10-02T10:00:00Z",
      endTime: "2026-10-02T14:00:00Z",
      totalHours: 4,
    };
    const res = handleMockRoute("POST", "http://localhost/api/rentals/hourly", payload);
    assert(res.status === 201, "Rental creation status should be 201");
    assert((res.data as { success: boolean }).success === true, "Rental creation should be successful");
    assert(Boolean((res.data as { bookingId?: string }).bookingId), "Rental creation should generate a bookingId");
  }
}
