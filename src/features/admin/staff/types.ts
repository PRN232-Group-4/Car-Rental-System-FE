export interface LicenseInfo {
  number?: string;
  type?: string;
  issueDate?: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  imgUrl?: string;
}

export type LicenseState = "valid" | "expiring" | "expired" | "missing";

export interface StaffDepartment {
  id: number;
  name: string;
}

export interface StaffFacility {
  id: number;
  name: string;
  address?: string;
}

export interface StaffListItem {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  department?: StaffDepartment | null;
  facility?: StaffFacility | null;
  isDriver: boolean;
  isActive: boolean;
  rating?: number | null;
  license?: LicenseInfo | null;
  roles?: string[];
  hiredDate?: string;
}

export interface StaffDetail extends StaffListItem {
  gender?: string | null;
  address?: string | null;
  totalTrips?: number;
  activeTripId?: number | null;
}

export interface StaffFilterParams {
  search?: string;
  departmentId?: string; // id hoặc 'all'
  facilityId?: string; // id hoặc 'all'
  isDriver?: string; // 'all' | 'driver' | 'staff'
  isActive?: string; // 'all' | 'active' | 'locked'
  licenseStatus?: string; // 'all' | 'valid' | 'expiring' | 'expired' | 'missing'
  page?: number;
  pageSize?: number;
  sortBy?: "fullName" | "hiredDate" | "rating" | "email";
  sortOrder?: "asc" | "desc";
}

export interface StaffPageResult {
  items: StaffListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export type ScheduleItemStatus =
  | "assigned"
  | "reassigned"
  | "completed"
  | "cancelled";

export interface DriverScheduleItem {
  assignmentId: number;
  rentalId: number;
  driverStaffId: number;
  driverName?: string;
  vehicleId?: number;
  vehicleName?: string;
  licensePlate?: string;
  start: string; // ISO UTC
  end: string; // ISO UTC
  bufferMinutes?: number; // mặc định 60 phút
  status: ScheduleItemStatus;
  note?: string;
}

export type IneligibleReasonCode =
  | "BUSY"
  | "LICENSE_EXPIRING"
  | "LICENSE_EXPIRED"
  | "INACTIVE"
  | "NOT_DRIVER"
  | string;

export interface AssignableDriver {
  staffId: number;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  eligible: boolean;
  reasons: IneligibleReasonCode[];
}

export type AssignDriverReason =
  | "driver_unavailable"
  | "driver_request"
  | "customer_request"
  | "other";

export interface AssignDriverInput {
  rentalId: number;
  driverStaffId: number;
  reason: AssignDriverReason;
  notes?: string;
  currentActorEmail?: string;
}

export interface CreateStaffInput {
  userId: number;
  departmentId: number;
  facilityId: number;
  hiredDate: string;
  isDriver: boolean;
  license?: LicenseInfo;
}

export interface UpdateStaffInput {
  staffId: number;
  departmentId?: number;
  facilityId?: number;
  isDriver?: boolean;
}

export interface UpdateLicenseInput {
  staffId: number;
  license: LicenseInfo;
}
