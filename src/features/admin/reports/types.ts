export type ReportStatus =
  | "new"
  | "in_progress"
  | "resolved"
  | "rejected"
  | string;

export type ReportType =
  | "vehicle_issue"
  | "accident"
  | "billing"
  | "staff_attitude"
  | "cleanliness"
  | "other"
  | string;

export interface ReportCustomer {
  id?: number;
  fullName: string;
  phone?: string;
  email?: string;
}

export interface ReportRentalContext {
  id: number;
  vehicleName: string;
  licensePlate?: string;
  start: string;
  end: string;
  status: string;
  driverName?: string;
}

export interface ReportMaintenanceContext {
  id: number;
  type?: string;
  status?: string;
  isSafe?: boolean | null;
  cost?: number;
  scheduledDate?: string;
}

export interface ReportNote {
  id: number;
  at: string;
  by?: string;
  kind: "internal" | "customer";
  text: string;
}

export interface ReportHistoryItem {
  at: string;
  by?: string;
  from?: ReportStatus;
  to: ReportStatus;
  reason?: string;
}

export interface ReportListItem {
  id: number;
  vehicleId?: number;
  type: ReportType;
  status: ReportStatus;
  descriptionPreview: string;
  createdAt: string;
  updatedAt?: string;
  customer: ReportCustomer;
  rentalId?: number | null;
  maintenanceId?: number | null;
  rental?: ReportRentalContext | null;
  maintenance?: ReportMaintenanceContext | null;
  handledBy?: string | null;
  resolvedAt?: string | null;
}

export interface ReportDetail extends ReportListItem {
  description: string;
  imageUrls?: string[];
  notes?: ReportNote[];
  history?: ReportHistoryItem[];
}

export interface ReportFilterParams {
  status?: string;
  type?: string;
  search?: string;
  hasRental?: boolean;
  hasMaintenance?: boolean;
  isOverdueSla?: boolean;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateMaintenancePayload {
  reportId: number;
  facilityId: number | null;
  scheduledDate: string;
  assignedStaffId: number;
}
