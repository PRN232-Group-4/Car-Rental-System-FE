import { describe, it, expect } from "vitest";
import { mapSubscriptionPlanFromBE, mapCustomerSubscriptionFromBE } from "./subscriptions/mappers";
import { mapVehicleFromBE } from "./vehicles/mappers";
import { mapRentalFromBE } from "./rentals/mappers";
import { mapInvoiceFromBE } from "./invoices/api";
import { mapPaymentFromBE } from "./payments/api";

describe("Domain Mappers (BE to UI)", () => {
  // Payloads mirror the generated OpenAPI schema (camelCase), which is what the
  // live backend actually returns.
  it("correctly maps SubscriptionPlan from BE", () => {
    const raw = {
      id: 10,
      name: "Gói Trải Nghiệm",
      price: 1500000,
      includedHours: 25,
      durationDays: 45,
      isActive: true,
    };
    const plan = mapSubscriptionPlanFromBE(raw);
    expect(plan.id).toBe(10);
    expect(plan.name).toBe("Gói Trải Nghiệm");
    expect(plan.hours).toBe(25);
    expect(plan.validityDays).toBe(45);
    expect(plan.features.length).toBeGreaterThan(0);
  });

  it("correctly maps CustomerSubscription from BE", () => {
    const raw = {
      id: 1,
      customerId: 42,
      planId: 10,
      planName: "Gói Đô Thị",
      startDate: "2026-10-01T00:00:00Z",
      endDate: "2026-11-01T00:00:00Z",
      totalHours: 30,
      remainingHours: 12.5,
      status: "active",
    };
    const sub = mapCustomerSubscriptionFromBE(raw);
    expect(sub.id).toBe(1);
    expect(sub.remainingHours).toBe(12.5);
    expect(sub.status).toBe("active");
  });

  it("correctly maps Vehicle from BE", () => {
    const raw = {
      id: 5,
      vehicleTypeId: 2,
      vehicleType: "electric_car",
      facilityId: 1,
      facility: "Chi nhánh Hà Nội",
      brand: "VinFast",
      model: "VF 8",
      hourlyPrice: 150000,
      status: "available",
      detail: {
        seatCount: 5,
        transmission: "Tự động",
        batteryCapacity: "87.7 kWh",
        maxRangeKm: 420,
      },
    };
    const vehicle = mapVehicleFromBE(raw);
    expect(vehicle.id).toBe(5);
    expect(vehicle.name).toBe("VinFast VF 8");
    expect(vehicle.category).toBe("electric_car");
    expect(vehicle.seats).toBe(5);
    expect(vehicle.maxRange).toBe("420 km");
    expect(vehicle.isAvailable).toBe(true);
  });

  it("correctly maps Rental from BE", () => {
    const raw = {
      id: 100,
      customerId: 1,
      vehicleId: 5,
      rentalType: "hourly",
      status: "ongoing",
      isSubscription: true,
      subscriptionId: 1,
      vatPrice: 0,
      depositPrice: 0,
      overtimePrice: 0,
      totalPrice: 0,
    };
    const rental = mapRentalFromBE(raw);
    expect(rental.id).toBe(100);
    expect(rental.isSubscription).toBe(true);
    expect(rental.subscriptionId).toBe(1);
  });

  it("correctly maps Invoice and Payment from BE", () => {
    const rawInv = {
      id: 99,
      rentalId: 100,
      invoiceNumber: "INV-99",
      amount: 2500000,
      vatAmount: 250000,
      status: "paid",
    };
    const inv = mapInvoiceFromBE(rawInv);
    expect(inv.id).toBe(99);
    expect(inv.amount).toBe(2500000);
    expect(inv.status).toBe("paid");

    const rawPay = {
      id: 1,
      rentalId: 100,
      invoiceId: 99,
      type: "deposit",
      amount: 2000000,
      status: "paid",
      method: "payos",
    };
    const pay = mapPaymentFromBE(rawPay);
    expect(pay.id).toBe(1);
    expect(pay.type).toBe("deposit");
    expect(pay.method).toBe("payos");
  });

  it("quy 'unpaid' của BE về 'pending' và giữ nguyên 'cancelled'", () => {
    // BE trả 'unpaid' cho hoá đơn chưa trả; badge/filter/CTA của FE chỉ hiểu 'pending'.
    expect(mapInvoiceFromBE({ id: 1, status: "unpaid" }).status).toBe("pending");
    expect(mapInvoiceFromBE({ id: 1, status: "UNPAID" }).status).toBe("pending");
    expect(mapInvoiceFromBE({ id: 1, status: "Cancelled" }).status).toBe("cancelled");
    expect(mapInvoiceFromBE({ id: 1, status: "paid" }).status).toBe("paid");
  });

  it("still tolerates PascalCase payloads from legacy serializers", () => {
    const plan = mapSubscriptionPlanFromBE({
      Id: 7,
      Name: "Legacy",
      Price: 100,
      IncludedHours: 3,
      DurationDays: 10,
    });
    expect(plan.id).toBe(7);
    expect(plan.hours).toBe(3);
    expect(plan.validityDays).toBe(10);
  });
});
