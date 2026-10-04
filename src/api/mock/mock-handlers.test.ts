import { describe, it, expect } from "vitest";
import { handleMockRoute } from "./mock-handlers";
import { mockStore } from "./mock-store";

describe("Mock Handlers Suite", () => {
  it("GET /api/health returns 200 ok", () => {
    const res = handleMockRoute("GET", "http://localhost/api/health");
    expect(res.status).toBe(200);
    expect((res.data as { status: string }).status).toBe("ok");
  });

  it("GET /api/facilities returns non-empty list", () => {
    const res = handleMockRoute("GET", "http://localhost/api/facilities");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect((res.data as unknown[]).length).toBeGreaterThan(0);
  });

  it("GET /api/vehicles?category=electric_car filters correctly", () => {
    const res = handleMockRoute("GET", "http://localhost/api/vehicles?category=electric_car");
    expect(res.status).toBe(200);
    expect(
      (res.data as { category: string }[]).every((v) => v.category === "electric_car")
    ).toBe(true);
  });

  it("GET /api/subscription-plans returns plans array", () => {
    const res = handleMockRoute("GET", "http://localhost/api/subscription-plans");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });

  it("POST /api/rentals/hourly creates rental booking", () => {
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
    expect(res.status).toBe(201);
    expect((res.data as { success: boolean }).success).toBe(true);
    expect(Boolean((res.data as { bookingId?: string }).bookingId)).toBe(true);
  });

  it("GET /api/invoices and GET /api/invoices/1 return invoices", () => {
    mockStore.reset();
    const listRes = handleMockRoute("GET", "http://localhost/api/invoices");
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.data)).toBe(true);

    const singleRes = handleMockRoute("GET", "http://localhost/api/invoices/1");
    expect(singleRes.status).toBe(200);
    expect((singleRes.data as { id: number }).id).toBe(1);
  });

  it("POST /api/invoices/1/checkout marks paid and returns checkoutUrl", () => {
    mockStore.reset();
    const checkoutRes = handleMockRoute("POST", "http://localhost/api/invoices/1/checkout");
    expect(checkoutRes.status).toBe(200);
    expect((checkoutRes.data as { checkoutUrl: string }).checkoutUrl).toContain("status=PAID");

    const afterRes = handleMockRoute("GET", "http://localhost/api/invoices/1");
    expect((afterRes.data as { status: string }).status).toBe("paid");
  });

  it("GET /api/payments returns payment records", () => {
    mockStore.reset();
    const payRes = handleMockRoute("GET", "http://localhost/api/payments?invoiceId=2");
    expect(payRes.status).toBe(200);
    expect(Array.isArray(payRes.data)).toBe(true);
    expect((payRes.data as { invoiceId: number }[])[0].invoiceId).toBe(2);
  });

  it("GET & POST customer subscriptions work properly", () => {
    mockStore.reset();
    const getRes = handleMockRoute("GET", "http://localhost/api/customer-subscriptions");
    expect(getRes.status).toBe(200);
    expect(Array.isArray(getRes.data)).toBe(true);

    const postRes = handleMockRoute("POST", "http://localhost/api/subscription-plans/1/purchase");
    expect(postRes.status).toBe(200);
    const checkout = postRes.data as { orderCode: number; checkoutUrl: string };
    expect(checkout.checkoutUrl).toContain("type=subscription");
    expect(checkout.orderCode).toBeGreaterThanOrEqual(1_000_000_000);
  });

  it("GET & PUT customer/license work properly", () => {
    mockStore.reset();
    const getRes = handleMockRoute("GET", "http://localhost/api/customer/license");
    expect(getRes.status).toBe(200);
    expect((getRes.data as { verificationStatus: string }).verificationStatus).toBe("approved");

    const putRes = handleMockRoute("PUT", "http://localhost/api/customer/license", {
      licenseNumber: "123456789012",
    });
    expect(putRes.status).toBe(200);
    expect((putRes.data as { licenseNumber: string }).licenseNumber).toBe("123456789012");
  });

  it("POST /api/account/registrations flow works properly", () => {
    mockStore.reset();
    const startRes = handleMockRoute("POST", "http://localhost/api/account/registrations", {
      email: "newuser@example.com",
      fullName: "Tran Van Moi",
      password: "password123456!",
    });
    expect(startRes.status).toBe(202);
    expect(Boolean((startRes.data as { message: string }).message)).toBe(true);

    // Verify registration with correct OTP
    const verifyRes = handleMockRoute("POST", "http://localhost/api/account/registrations/verify", {
      email: "newuser@example.com",
      otp: "123456",
    });
    expect(verifyRes.status).toBe(201);

    // The user should now exist in mockStore
    const user = mockStore.findUserByEmail("newuser@example.com");
    expect(user).toBeDefined();
    expect(user?.fullName).toBe("Tran Van Moi");

    // Resend test
    const resendRes = handleMockRoute("POST", "http://localhost/api/account/registrations/resend", {
      email: "newuser@example.com",
    });
    expect(resendRes.status).toBe(202);
  });
});

