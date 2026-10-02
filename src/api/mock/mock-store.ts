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

export class MockDataStore {
  private facilities: FacilityCatalogItem[] = [];
  private vehicles: VehicleCatalogItem[] = [];
  private subscriptionPlans: SubscriptionPlanCatalogItem[] = [];
  private inspectionRecords: Map<string, InspectionRecordItem> = new Map();
  private rentals: MockRentalRecord[] = [];

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
}

export const mockStore = new MockDataStore();
