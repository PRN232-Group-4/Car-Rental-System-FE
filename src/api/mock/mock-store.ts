import {
  MOCK_FACILITIES,
  MOCK_VEHICLES,
  MOCK_SUBSCRIPTION_PLANS,
  FacilityCatalogItem,
  VehicleCatalogItem,
  SubscriptionPlanCatalogItem,
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

  // --- Facilities ---
  public getFacilities(): FacilityCatalogItem[] {
    return [...this.facilities];
  }

  public getFacilityById(id: string): FacilityCatalogItem | undefined {
    return this.facilities.find((f) => f.id === id);
  }

  // --- Vehicles ---
  public getVehicles(params?: {
    facilityId?: string;
    category?: string;
    search?: string;
    status?: string;
  }): VehicleCatalogItem[] {
    let result = [...this.vehicles];

    if (params?.facilityId && params.facilityId !== "all") {
      result = result.filter((v) => v.facilityId === params.facilityId);
    }

    if (params?.category && params.category !== "all") {
      result = result.filter((v) => v.category === params.category);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.categoryLabel.toLowerCase().includes(q) ||
          v.facilityName.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public getVehicleById(id: string): VehicleCatalogItem | undefined {
    return this.vehicles.find((v) => v.id === id);
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
