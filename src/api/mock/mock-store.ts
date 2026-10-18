import {
  MOCK_FACILITIES,
  MOCK_VEHICLES,
  MOCK_SUBSCRIPTION_PLANS,
  FacilityCatalogItem,
  VehicleCatalogItem,
  SubscriptionPlanCatalogItem,
  MockRentalPolicyItem,
  MockBusySlotItem,
  MOCK_ACTIVE_POLICIES,
  MOCK_BUSY_SLOTS,
} from "./mock-catalog";
import {
  MOCK_INSPECTION_RECORD,
  InspectionRecordItem,
} from "./mock-grading";

export interface MockRentalRecord {
  id: string;
  rentalType: "hourly" | "longterm";
  vehicleId: string;
  vehicleName: string;
  facilityId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  driverLicenseNumber: string;
  startTime: string;
  endTime: string;
  totalHours?: number;
  totalMonths?: number;
  estimatedCost: number;
  status: "confirmed" | "active" | "completed" | "cancelled";
  createdAt: string;
}

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  gender?: string;
  phone?: string;
  avatarUrl?: string;
  roles: string[];
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "usr-cust-001",
    email: "customer@example.com",
    fullName: "Nguyễn Văn An",
    gender: "Nam",
    phone: "0901 234 567",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    roles: ["Customer"],
  },
  {
    id: "usr-admin-001",
    email: "admin@thongdong.vn",
    fullName: "Lê Hoàng Quân",
    gender: "Nam",
    phone: "0988 888 999",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    roles: ["Admin", "Staff"],
  },
  {
    id: "usr-staff-001",
    email: "staff@thongdong.vn",
    fullName: "Trần Thị Mai",
    gender: "Nữ",
    phone: "0912 345 678",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    roles: ["Staff"],
  },
];

export interface MockInvoiceRecord {
  id: number;
  rentalId: number;
  invoiceNumber: string;
  amount: number;
  vatAmount: number;
  status: "pending" | "paid" | "cancelled";
  issuedAt: string;
  dueAt?: string | null;
}

export interface MockPaymentRecord {
  id: number;
  rentalId: number;
  invoiceId: number | null;
  type: string;
  amount: number;
  status: "paid" | "requested" | "failed";
  method: string;
  providerReference: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface MockCustomerSubscriptionRecord {
  id: number;
  customerId: number;
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  remainingHours: number;
  status: "active" | "expired" | "exhausted";
}

export interface MockCustomerLicenseRecord {
  licenseNumber: string;
  fullName: string;
  dateOfBirth: string;
  class: string;
  expiryDate: string;
  frontPhotoUrl: string;
  backPhotoUrl: string;
  verificationStatus: "unsubmitted" | "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  verifiedAt: string | null;
}

export class MockDataStore {
  private facilities: FacilityCatalogItem[] = [];
  private vehicles: VehicleCatalogItem[] = [];
  private subscriptionPlans: SubscriptionPlanCatalogItem[] = [];
  private inspectionRecords: Map<string, InspectionRecordItem> = new Map();
  private rentals: MockRentalRecord[] = [];
  private users: MockUser[] = [];
  private currentUser: MockUser | null = null;
  private invoices: MockInvoiceRecord[] = [];
  private payments: MockPaymentRecord[] = [];
  private customerSubscriptions: MockCustomerSubscriptionRecord[] = [];
  private customerLicense: MockCustomerLicenseRecord | null = null;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.facilities = JSON.parse(JSON.stringify(MOCK_FACILITIES));
    this.vehicles = JSON.parse(JSON.stringify(MOCK_VEHICLES));
    this.subscriptionPlans = JSON.parse(JSON.stringify(MOCK_SUBSCRIPTION_PLANS));
    this.inspectionRecords = new Map();
    this.inspectionRecords.set("latest", JSON.parse(JSON.stringify(MOCK_INSPECTION_RECORD)));
    this.inspectionRecords.set(MOCK_INSPECTION_RECORD.rentalId, JSON.parse(JSON.stringify(MOCK_INSPECTION_RECORD)));
    this.rentals = [];
    this.users = JSON.parse(JSON.stringify(MOCK_USERS));
    this.currentUser = this.users[0]; // Nguyễn Văn An default for mock dev mode

    this.invoices = [
      {
        id: 1,
        rentalId: 101,
        invoiceNumber: "INV-2026-00101",
        amount: 3200000,
        vatAmount: 200000,
        status: "pending",
        issuedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        dueAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 2,
        rentalId: 98,
        invoiceNumber: "INV-2026-00098",
        amount: 1980000,
        vatAmount: 180000,
        status: "paid",
        issuedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        dueAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
      },
    ];

    this.payments = [
      {
        id: 1,
        rentalId: 98,
        invoiceId: 2,
        type: "rental",
        amount: 1980000,
        status: "paid",
        method: "payos",
        providerReference: "PAYOS-9812401",
        paidAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 2,
        rentalId: 98,
        invoiceId: 2,
        type: "refund",
        amount: 2000000,
        status: "paid",
        method: "deposit",
        providerReference: "REFUND-DEP-98",
        paidAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 3,
        rentalId: 101,
        invoiceId: 1,
        type: "deposit",
        amount: 2000000,
        status: "requested",
        method: "deposit",
        providerReference: null,
        paidAt: null,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ];

    this.customerSubscriptions = [
      {
        id: 1,
        customerId: 1,
        planId: 2,
        planName: "Gói Đô Thị 20 Giờ",
        startDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(),
        totalHours: 20,
        remainingHours: 14.5,
        status: "active",
      },
    ];

    this.customerLicense = {
      licenseNumber: "079095012345",
      fullName: "Nguyễn Văn An",
      dateOfBirth: "1995-05-15",
      class: "B2",
      expiryDate: "2032-05-15",
      frontPhotoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
      backPhotoUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
      verificationStatus: "approved",
      rejectionReason: null,
      verifiedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    };
  }

  // --- Auth / User ---
  public findUserByEmail(email: string): MockUser | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  public setCurrentUser(user: MockUser | null): void {
    this.currentUser = user;
  }

  private pendingRegistrations: Map<
    string,
    { email: string; fullName: string; password: string; otp: string }
  > = new Map();

  public startRegistration(email: string, fullName: string, password: string): { otp: string } {
    const otp = "123456";
    this.pendingRegistrations.set(email.toLowerCase(), { email, fullName, password, otp });
    return { otp };
  }

  public verifyRegistration(email: string, otp: string): boolean {
    const pending = this.pendingRegistrations.get(email.toLowerCase());
    if (!pending) return false;
    if (pending.otp !== otp && otp !== "123456") return false;

    const existing = this.findUserByEmail(email);
    if (!existing) {
      const newUser: MockUser = {
        id: `usr-cust-${Date.now()}`,
        email: pending.email,
        fullName: pending.fullName,
        roles: ["Customer"],
      };
      this.users.push(newUser);
    }
    this.pendingRegistrations.delete(email.toLowerCase());
    return true;
  }


  // --- Facilities ---
  public getFacilities(): FacilityCatalogItem[] {
    return [...this.facilities];
  }

  public getFacilityById(id: string): FacilityCatalogItem | undefined {
    return this.facilities.find((f) => f.id === id);
  }

  // --- Vehicles ---
  // --- Vehicles ---
  public getVehicles(params?: {
    facilityId?: string | number;
    category?: string;
    brand?: string;
    seats?: number;
    transmission?: string;
    fuelType?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
    status?: string;
    sort?: "price_asc" | "price_desc" | "year_desc" | "name_asc";
  }): VehicleCatalogItem[] {
    let result = [...this.vehicles];

    if (params?.facilityId && params.facilityId !== "all") {
      result = result.filter((v) => String(v.facilityId) === String(params.facilityId));
    }

    if (params?.category && params.category !== "all") {
      result = result.filter((v) => v.category === params.category);
    }

    if (params?.brand && params.brand !== "all") {
      result = result.filter((v) => v.brand?.toLowerCase() === params.brand?.toLowerCase());
    }

    if (params?.seats && Number(params.seats) > 0) {
      result = result.filter((v) => v.seats === Number(params.seats));
    }

    if (params?.transmission && params.transmission !== "all") {
      result = result.filter((v) => v.transmission.toLowerCase().includes(params.transmission!.toLowerCase()));
    }

    if (params?.fuelType && params.fuelType !== "all") {
      const ft = params.fuelType.toLowerCase();
      result = result.filter((v) => {
        if (ft === "electric") return v.category.includes("electric");
        if (ft === "petrol" || ft === "xăng") return !v.category.includes("electric");
        return v.fuelType?.toLowerCase().includes(ft);
      });
    }

    if (params?.priceMin && Number(params.priceMin) > 0) {
      result = result.filter((v) => v.hourlyPrice >= Number(params.priceMin));
    }

    if (params?.priceMax && Number(params.priceMax) > 0) {
      result = result.filter((v) => v.hourlyPrice <= Number(params.priceMax));
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.categoryLabel.toLowerCase().includes(q) ||
          v.facilityName.toLowerCase().includes(q) ||
          (v.brand && v.brand.toLowerCase().includes(q)) ||
          (v.model && v.model.toLowerCase().includes(q))
      );
    }

    // Sắp xếp
    if (params?.sort) {
      switch (params.sort) {
        case "price_asc":
          result.sort((a, b) => a.hourlyPrice - b.hourlyPrice);
          break;
        case "price_desc":
          result.sort((a, b) => b.hourlyPrice - a.hourlyPrice);
          break;
        case "year_desc":
          result.sort((a, b) => b.year - a.year);
          break;
        case "name_asc":
          result.sort((a, b) => a.name.localeCompare(b.name, "vi"));
          break;
      }
    }

    return result;
  }

  public getVehiclesPaginated(params?: {
    facilityId?: string | number;
    category?: string;
    brand?: string;
    seats?: number;
    transmission?: string;
    fuelType?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
    status?: string;
    sort?: "price_asc" | "price_desc" | "year_desc" | "name_asc";
    page?: number;
    pageSize?: number;
  }): { items: VehicleCatalogItem[]; totalCount: number; page: number; pageSize: number } {
    const allFiltered = this.getVehicles(params);
    const totalCount = allFiltered.length;
    const page = Math.max(1, Number(params?.page) || 1);
    const pageSize = Math.max(1, Number(params?.pageSize) || 9);
    const startIndex = (page - 1) * pageSize;
    const items = allFiltered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      totalCount,
      page,
      pageSize,
    };
  }

  public getVehicleById(id: string): VehicleCatalogItem | undefined {
    return this.vehicles.find((v) => String(v.id) === String(id));
  }

  public getVehicleBusySlots(vehicleId: string, from?: string, to?: string): MockBusySlotItem[] {
    const defaultSlots = MOCK_BUSY_SLOTS[vehicleId] ?? [
      {
        from: "2026-10-25T01:00:00.000Z",
        to: "2026-10-27T10:00:00.000Z",
        reason: "Đã có đơn thuê",
        isBuffer: false,
      },
      {
        from: "2026-10-27T10:00:00.000Z",
        to: "2026-10-27T11:00:00.000Z",
        reason: "Đệm kỹ thuật 60 phút",
        isBuffer: true,
      },
    ];

    if (!from && !to) return defaultSlots;

    return defaultSlots.filter((slot) => {
      if (from && new Date(slot.to).getTime() < new Date(from).getTime()) return false;
      if (to && new Date(slot.from).getTime() > new Date(to).getTime()) return false;
      return true;
    });
  }

  public checkVehicleAvailability(vehicleId: string, from: string, to: string): {
    vehicleId: string;
    available: boolean;
    reason?: string;
    nextAvailableFrom?: string;
    conflictingBooking?: { from: string; to: string };
  } {
    const busySlots = this.getVehicleBusySlots(vehicleId);
    const reqStart = new Date(from).getTime();
    const reqEnd = new Date(to).getTime();

    for (const slot of busySlots) {
      const slotStart = new Date(slot.from).getTime();
      const slotEnd = new Date(slot.to).getTime();

      // Overlap: reqStart < slotEnd && reqEnd > slotStart
      if (reqStart < slotEnd && reqEnd > slotStart) {
        return {
          vehicleId,
          available: false,
          reason: slot.reason || "Trùng lịch đơn thuê hoặc bảo dưỡng",
          nextAvailableFrom: slot.to,
          conflictingBooking: {
            from: slot.from,
            to: slot.to,
          },
        };
      }
    }

    return {
      vehicleId,
      available: true,
    };
  }

  public getActivePolicyForVehicleType(vehicleTypeId: number): MockRentalPolicyItem | undefined {
    return MOCK_ACTIVE_POLICIES[vehicleTypeId] ?? MOCK_ACTIVE_POLICIES[1];
  }

  // --- Subscription Plans ---
  public getSubscriptionPlans(): SubscriptionPlanCatalogItem[] {
    return [...this.subscriptionPlans];
  }

  public getSubscriptionPlanById(id: string): SubscriptionPlanCatalogItem | undefined {
    return this.subscriptionPlans.find((p) => p.id === id);
  }

  // --- Inspections ---
  public getInspectionRecord(rentalId?: string): InspectionRecordItem {
    if (rentalId && this.inspectionRecords.has(rentalId)) {
      return this.inspectionRecords.get(rentalId)!;
    }
    return this.inspectionRecords.get("latest") || MOCK_INSPECTION_RECORD;
  }

  // --- Rentals / Bookings ---
  public createRental(rentalData: {
    rentalType: "hourly" | "longterm";
    vehicleId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    driverLicenseNumber?: string;
    startTime: string;
    endTime: string;
    totalHours?: number;
    totalMonths?: number;
    estimatedCost?: number;
  }): MockRentalRecord {
    const vehicle = this.getVehicleById(rentalData.vehicleId);
    const rentalId = `TD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let calculatedCost = rentalData.estimatedCost || 0;
    if (!calculatedCost && vehicle) {
      if (rentalData.rentalType === "hourly") {
        const hours = rentalData.totalHours || 4;
        calculatedCost = hours * vehicle.hourlyPrice;
      } else {
        const months = rentalData.totalMonths || 1;
        calculatedCost = months * vehicle.monthlyPrice;
      }
    }

    const record: MockRentalRecord = {
      id: rentalId,
      rentalType: rentalData.rentalType,
      vehicleId: rentalData.vehicleId,
      vehicleName: vehicle ? vehicle.name : "Phương tiện Thong Dong",
      facilityId: vehicle ? vehicle.facilityId : "fac-q1",
      customerName: rentalData.customerName,
      customerPhone: rentalData.customerPhone,
      customerEmail: rentalData.customerEmail || "",
      driverLicenseNumber: rentalData.driverLicenseNumber || "",
      startTime: rentalData.startTime,
      endTime: rentalData.endTime,
      totalHours: rentalData.totalHours,
      totalMonths: rentalData.totalMonths,
      estimatedCost: calculatedCost,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    this.rentals.push(record);
    return record;
  }

  public getRentals(): MockRentalRecord[] {
    return [...this.rentals];
  }

  public getRentalById(id: string): MockRentalRecord | undefined {
    return this.rentals.find((r) => r.id === id);
  }

  // --- Invoices ---
  public getInvoices(): MockInvoiceRecord[] {
    return [...this.invoices];
  }

  public getInvoiceById(id: number | string): MockInvoiceRecord | undefined {
    return this.invoices.find((inv) => String(inv.id) === String(id));
  }

  public markInvoicePaid(id: number | string): MockInvoiceRecord | undefined {
    const inv = this.getInvoiceById(id);
    if (inv) {
      inv.status = "paid";
    }
    return inv;
  }

  // --- Payments ---
  public getPayments(invoiceId?: number | string): MockPaymentRecord[] {
    if (invoiceId) {
      return this.payments.filter((p) => String(p.invoiceId) === String(invoiceId));
    }
    return [...this.payments];
  }

  // --- Subscriptions ---
  public getCustomerSubscriptions(): MockCustomerSubscriptionRecord[] {
    return [...this.customerSubscriptions];
  }

  public addCustomerSubscription(planId: number | string): MockCustomerSubscriptionRecord {
    const plan = this.getSubscriptionPlanById(String(planId));
    const newSub: MockCustomerSubscriptionRecord = {
      id: Date.now(),
      customerId: 1,
      planId: Number(planId),
      planName: plan?.name || `Gói thuê bao #${planId}`,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (plan?.validityDays || 30) * 24 * 3600 * 1000).toISOString(),
      totalHours: plan ? plan.hours : 20,
      remainingHours: plan ? plan.hours : 20,
      status: "active",
    };
    this.customerSubscriptions.unshift(newSub);
    return newSub;
  }

  // --- License ---
  public getCustomerLicense(): MockCustomerLicenseRecord | null {
    return this.customerLicense;
  }

  public saveCustomerLicense(data: Partial<MockCustomerLicenseRecord>): MockCustomerLicenseRecord {
    if (!this.customerLicense) {
      this.customerLicense = {
        licenseNumber: data.licenseNumber || "",
        fullName: data.fullName || "",
        dateOfBirth: data.dateOfBirth || "1995-01-01",
        class: data.class || "B2",
        expiryDate: data.expiryDate || "2035-01-01",
        frontPhotoUrl: data.frontPhotoUrl || "",
        backPhotoUrl: data.backPhotoUrl || "",
        verificationStatus: "pending",
        rejectionReason: null,
        verifiedAt: null,
      };
    } else {
      this.customerLicense = {
        ...this.customerLicense,
        ...data,
        verificationStatus: data.verificationStatus || "pending",
      };
    }
    return this.customerLicense;
  }
}

export const mockStore = new MockDataStore();
