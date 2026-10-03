import { mockStore } from "./mock-store";

export interface MockHandlerResponse {
  status: number;
  data: unknown;
  headers?: Record<string, string>;
}

interface MockRentalPayload {
  vehicleId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  driverLicenseNumber?: string;
  startTime?: string;
  endTime?: string;
  totalHours?: number;
  totalMonths?: number;
  estimatedCost?: number;
}

/**
 * Normalizes an API path by stripping leading/trailing slashes and optional '/api' prefix.
 */
function normalizePath(rawPath: string): string {
  let path = rawPath.replace(/^\/+/, "").replace(/\/+$/, "");
  if (path.startsWith("api/")) {
    path = path.slice(4);
  } else if (path === "api") {
    path = "";
  }
  return path;
}

export function handleMockRoute(
  method: string,
  urlStr: string,
  body?: unknown
): MockHandlerResponse {
  const upperMethod = method.toUpperCase();
  const url = new URL(urlStr, "http://localhost");
  const path = normalizePath(url.pathname);
  const params = url.searchParams;

  // 1. Health check
  if (upperMethod === "GET" && (path === "health" || path === "")) {
    return {
      status: 200,
      data: {
        status: "ok",
        mode: "mock",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        service: "Thong Dong Car Rental Mock API",
      },
    };
  }

  // 2. Facilities
  if (upperMethod === "GET" && path === "facilities") {
    return {
      status: 200,
      data: mockStore.getFacilities(),
    };
  }

  if (upperMethod === "GET" && path.startsWith("facilities/")) {
    const id = path.split("/")[1];
    const facility = mockStore.getFacilityById(id);
    if (!facility) {
      return { status: 404, data: { message: `Facility '${id}' not found` } };
    }
    return { status: 200, data: facility };
  }

  // 3. Vehicles
  if (upperMethod === "GET" && path === "vehicles") {
    const facilityId = params.get("facilityId") || undefined;
    const category = params.get("category") || undefined;
    const search = params.get("search") || undefined;

    const vehicles = mockStore.getVehicles({ facilityId, category, search });
    return {
      status: 200,
      data: vehicles,
    };
  }

  if (upperMethod === "GET" && path.startsWith("vehicles/")) {
    const id = path.split("/")[1];
    const vehicle = mockStore.getVehicleById(id);
    if (!vehicle) {
      return { status: 404, data: { message: `Vehicle '${id}' not found` } };
    }
    return { status: 200, data: vehicle };
  }

  // 4. Subscription Plans
  if (upperMethod === "GET" && path === "subscription-plans") {
    return {
      status: 200,
      data: mockStore.getSubscriptionPlans(),
    };
  }

  if (upperMethod === "GET" && path.startsWith("subscription-plans/purchases/")) {
    return {
      status: 200,
      data: { orderCode: Number(path.split("/")[2]) || 0, status: "paid" },
    };
  }

  if (upperMethod === "GET" && path.startsWith("subscription-plans/")) {
    const id = path.split("/")[1];
    const plan = mockStore.getSubscriptionPlanById(id);
    if (!plan) {
      return { status: 404, data: { message: `Plan '${id}' not found` } };
    }
    return { status: 200, data: plan };
  }

  // 5. Inspections & Grading
  if (
    upperMethod === "GET" &&
    (path === "inspections/latest" || path === "grading/latest" || path === "inspections")
  ) {
    return {
      status: 200,
      data: mockStore.getInspectionRecord(),
    };
  }

  if (upperMethod === "GET" && path.startsWith("rentals/") && path.includes("/inspections")) {
    const parts = path.split("/");
    const rentalId = parts[1];
    return {
      status: 200,
      data: mockStore.getInspectionRecord(rentalId),
    };
  }

  // 6. Rentals / Bookings
  if (upperMethod === "POST" && (path === "rentals/hourly" || path === "rentals/longterm" || path === "rentals")) {
    const rentalType = path.includes("longterm") ? "longterm" : "hourly";
    const payload = (body ?? {}) as MockRentalPayload;

    if (!payload.vehicleId || !payload.customerName || !payload.customerPhone) {
      return {
        status: 400,
        data: { message: "Vui lòng cung cấp đầy đủ thông tin: Xe, Họ tên, và Số điện thoại." },
      };
    }

    const created = mockStore.createRental({
      rentalType,
      vehicleId: payload.vehicleId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      customerEmail: payload.customerEmail,
      driverLicenseNumber: payload.driverLicenseNumber,
      startTime: payload.startTime || new Date().toISOString(),
      endTime: payload.endTime || new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      totalHours: payload.totalHours,
      totalMonths: payload.totalMonths,
      estimatedCost: payload.estimatedCost,
    });

    return {
      status: 201,
      data: {
        success: true,
        bookingId: created.id,
        rental: created,
        message: `Đã xác nhận đặt xe thành công! Mã đơn: ${created.id}. Nhân viên sẽ liên hệ trong ít phút.`,
      },
    };
  }

  // 7. Auth: Login
  if (upperMethod === "POST" && (path === "auth/login" || path === "login")) {
    const payload = (body ?? {}) as { email?: string; password?: string; rememberMe?: boolean };
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    if (!email || !password) {
      return {
        status: 400,
        data: { message: "Vui lòng nhập đầy đủ Email và Mật khẩu." },
      };
    }

    if (password.length < 12) {
      return {
        status: 400,
        data: { message: "Mật khẩu phải có độ dài tối thiểu 12 ký tự." },
      };
    }

    const user = mockStore.findUserByEmail(email);
    if (!user) {
      return {
        status: 401,
        data: { message: "Email hoặc mật khẩu không chính xác." },
      };
    }

    mockStore.setCurrentUser(user);

    return {
      status: 200,
      data: {
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
        message: "Đăng nhập thành công!",
      },
    };
  }

  // 8. Auth: Profile
  if (upperMethod === "GET" && (path === "account/profile" || path === "auth/profile")) {
    const user = mockStore.getCurrentUser();
    if (!user) {
      return {
        status: 401,
        data: { message: "Chưa đăng nhập." },
      };
    }

    return {
      status: 200,
      data: {
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
      },
    };
  }

  // 9. Auth: Logout
  if (upperMethod === "POST" && (path === "auth/logout" || path === "logout")) {
    mockStore.setCurrentUser(null);
    return {
      status: 204,
      data: null,
    };
  }

  // 10. Invoices & Checkout
  if (upperMethod === "GET" && path === "invoices") {
    return {
      status: 200,
      data: mockStore.getInvoices(),
    };
  }

  if (upperMethod === "POST" && path.startsWith("invoices/") && path.endsWith("/checkout")) {
    const id = path.split("/")[1];
    mockStore.markInvoicePaid(id);
    return {
      status: 200,
      data: {
        orderCode: Number(id) || Date.now(),
        paymentLinkId: `payos_mock_${id}`,
        checkoutUrl: `/payment/result?orderCode=${id}&status=PAID`,
      },
    };
  }

  if (upperMethod === "GET" && path.startsWith("invoices/")) {
    const id = path.split("/")[1];
    // If status=PAID is passed in query or previously paid, ensure it is marked paid
    if (params.get("status")?.toUpperCase() === "PAID") {
      mockStore.markInvoicePaid(id);
    }
    const invoice = mockStore.getInvoiceById(id);
    if (!invoice) {
      return {
        status: 404,
        data: { message: `Invoice '${id}' not found` },
      };
    }
    return {
      status: 200,
      data: invoice,
    };
  }

  // 11. Payments Ledger
  if (upperMethod === "GET" && path === "payments") {
    const invoiceId = params.get("invoiceId") || undefined;
    return {
      status: 200,
      data: mockStore.getPayments(invoiceId),
    };
  }

  // 12. Subscriptions: Customer & Purchase
  if (upperMethod === "GET" && (path === "customer-subscriptions" || path === "subscriptions/customer" || path === "customer/subscriptions")) {
    return {
      status: 200,
      data: mockStore.getCustomerSubscriptions(),
    };
  }

  if (upperMethod === "POST" && path.startsWith("subscription-plans/") && path.endsWith("/purchase")) {
    const planId = path.split("/")[1];
    const sub = mockStore.addCustomerSubscription(planId);
    const orderCode = 1_000_000_000 + Number(sub.id);
    return {
      status: 200,
      data: {
        orderCode,
        paymentLinkId: `payos_mock_${sub.id}`,
        checkoutUrl: `/payment/result?orderCode=${orderCode}&type=subscription&status=PAID`,
      },
    };
  }

  // 13. Customer License (GPLX)
  if (upperMethod === "GET" && (path === "customer/license" || path === "driver-license")) {
    return {
      status: 200,
      data: mockStore.getCustomerLicense(),
    };
  }

  if (upperMethod === "PUT" && (path === "customer/license" || path === "driver-license")) {
    const payload = (body ?? {}) as Record<string, unknown>;
    const updated = mockStore.saveCustomerLicense(payload);
    return {
      status: 200,
      data: updated,
    };
  }

  if (upperMethod === "POST" && (path === "customer/license/upload" || path === "upload/license")) {
    return {
      status: 200,
      data: {
        secure_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      },
    };
  }

  return {
    status: 404,
    data: { message: `Route [${upperMethod}] /${path} not found in mock handlers` },
  };
}
