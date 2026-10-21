import { backendApiClient } from "@/api/backend-api-client";

export interface VehicleTypeDto {
  id: number;
  name: string | null;
  fuelType: string | null;
  type: string | null;
}

export interface OrganizationUnitDto {
  id: number;
  name: string | null;
  address: string | null;
}

export interface RentalPolicyDto {
  id: number;
  vehicleTypeId: number | null;
  name: string | null;
  vatRate: number;
  overtimeFeeRate: number;
  depositPercentage: number;
  isActive: boolean;
  rentalCount?: number;
}

export interface RentalPolicyRequest {
  vehicleTypeId: number | null;
  name: string;
  vatRate: number;
  overtimeFeeRate: number;
  depositPercentage: number;
  isActive: boolean;
}

export interface SubscriptionPlanDto {
  id: number;
  name: string | null;
  description: string | null;
  price: number;
  durationDays: number;
  includedHours: number | null;
  isActive: boolean;
}

export interface SubscriptionPlanRequest {
  name: string;
  description: string;
  price: number;
  durationDays: number;
  includedHours: number | null;
  isActive: boolean;
}

export interface VehicleDetailDto {
  seatCount?: number | null;
  transmission?: string | null;
  trunkCapacity?: number | null;
  bikeType?: string | null;
  hasStorageBox?: boolean | null;
  batteryCapacity?: string | null;
  chargingType?: string | null;
  chargingTimeHours?: string | null;
  maxRangeKm?: number | null;
  batteryType?: string | null;
  galleryImages?: string[] | null;
}

export interface VehicleDto {
  id: number;
  vehicleTypeId: number;
  vehicleType: string | null;
  facilityId: number | null;
  facility: string | null;
  status: string | null;
  brand: string | null;
  model: string | null;
  color: string | null;
  yearOfManufacture: number | null;
  hourlyPrice: number | null;
  longtermPrice: number | null;
  description: string | null;
  mainImageUrl: string | null;
  location: string | null;
  licensePlate?: string | null;
  detail: VehicleDetailDto | null;
}

export interface VehicleRequest {
  licensePlate: string | null;
  vehicleTypeId: number;
  facilityId: number | null;
  status: string;
  brand: string;
  model: string;
  color: string;
  yearOfManufacture: number | null;
  hourlyPrice: number | null;
  longtermPrice: number | null;
  description: string;
  mainImageUrl: string | null;
  location: string;
  detail: VehicleDetailDto | null;
}

export interface PagedResult<T> {
  items: T[] | null;
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface StaffDto {
  id: number;
  userId: number;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  departmentId: number | null;
  departmentName: string | null;
  facilityId: number | null;
  facilityName: string | null;
  hiredDate: string | null;
  isDriver: boolean;
  licenseNumber: string | null;
  licenseType: string | null;
  licenseIssueDate: string | null;
  licenseExpiryDate: string | null;
  licenseImageUrl: string | null;
  licenseStatus?: string | null;
  rating: number | null;
  isActive: boolean;
  staffRole: string | null;
}

export interface CreateStaffRequest {
  email: string;
  fullName: string;
  password: string;
  phone: string;
  departmentId: number | null;
  facilityId: number | null;
  hiredDate: string | null;
  isDriver: boolean;
  licenseNumber: string | null;
  licenseType: string | null;
  licenseIssueDate: string | null;
  licenseExpiryDate: string | null;
  licenseImageUrl: string | null;
  staffRole: string;
}

export type UpdateStaffRequest = Omit<CreateStaffRequest, "email" | "password">;

export function getVehicleTypes() {
  return backendApiClient.get<VehicleTypeDto[]>("vehicle-types");
}

export function createVehicleType(body: { name: string; fuelType: string; type: string }) {
  return backendApiClient.post<VehicleTypeDto>("vehicle-types", body);
}

export function updateVehicleType(id: number, body: { name: string; fuelType: string; type: string }) {
  return backendApiClient.put<VehicleTypeDto>(`vehicle-types/${id}`, body);
}

export function deleteVehicleType(id: number) {
  return backendApiClient.delete<void>(`vehicle-types/${id}`);
}

export function getDepartments() {
  return backendApiClient.get<OrganizationUnitDto[]>("departments");
}

export function createDepartment(name: string) {
  return backendApiClient.post<OrganizationUnitDto>("departments", { name });
}

export function updateDepartment(id: number, name: string) {
  return backendApiClient.put<OrganizationUnitDto>(`departments/${id}`, { name });
}

export function deleteDepartment(id: number) {
  return backendApiClient.delete<void>(`departments/${id}`);
}

export async function getFacilities(): Promise<OrganizationUnitDto[]> {
  const items: OrganizationUnitDto[] = [];
  let page = 1;
  while (true) {
    const result = await backendApiClient.get<PagedResult<OrganizationUnitDto> | OrganizationUnitDto[]>("facilities", { page, pageSize: 100 });
    if (Array.isArray(result)) return items.concat(result);
    if (!result || !Array.isArray(result.items) || result.page !== page || !Number.isSafeInteger(result.totalCount) || result.totalCount < 0) {
      throw new Error("Dữ liệu chi nhánh không hợp lệ. Vui lòng thử lại.");
    }
    items.push(...result.items);
    if (items.length >= result.totalCount) return items;
    if (!result.items.length) throw new Error("Chưa tải đủ danh sách chi nhánh. Vui lòng thử lại.");
    page++;
  }
}

export function createFacility(body: { name: string; address: string }) {
  return backendApiClient.post<OrganizationUnitDto>("facilities", body);
}

export function updateFacility(id: number, body: { name: string; address: string }) {
  return backendApiClient.put<OrganizationUnitDto>(`facilities/${id}`, body);
}

export function deleteFacility(id: number) {
  return backendApiClient.delete<void>(`facilities/${id}`);
}

export async function getRentalPolicies(page = 1, pageSize = 20): Promise<PagedResult<RentalPolicyDto>> {
  const result = await backendApiClient.get<PagedResult<RentalPolicyDto> | RentalPolicyDto[]>("rental-policies", { page, pageSize });
  // During rollout, the previous backend returns an array with no usage counts.
  if (Array.isArray(result)) return { items: result.slice((page - 1) * pageSize, page * pageSize), page, pageSize, totalCount: result.length };
  return result;
}

export function createRentalPolicy(body: RentalPolicyRequest) {
  return backendApiClient.post<RentalPolicyDto>("rental-policies", body);
}

export function setRentalPolicyStatus(id: number, isActive: boolean) {
  return backendApiClient.patch<RentalPolicyDto>(`rental-policies/${id}/status`, { isActive });
}

export function getSubscriptionPlans(all = true) {
  return backendApiClient.get<SubscriptionPlanDto[]>("subscription-plans", { all });
}

export function createSubscriptionPlan(body: SubscriptionPlanRequest) {
  return backendApiClient.post<SubscriptionPlanDto>("subscription-plans", body);
}

export function updateSubscriptionPlan(id: number, body: SubscriptionPlanRequest) {
  return backendApiClient.put<SubscriptionPlanDto>(`subscription-plans/${id}`, body);
}

export function deleteSubscriptionPlan(id: number) {
  return backendApiClient.delete<void>(`subscription-plans/${id}`);
}

export function getVehicles(params: {
  vehicleTypeId?: number;
  facilityId?: number;
  status?: string;
  page: number;
  pageSize: number;
}) {
  return backendApiClient.get<PagedResult<VehicleDto>>("vehicles", params);
}

export function getVehicle(id: number) {
  return backendApiClient.get<VehicleDto>(`vehicles/${id}`);
}

export function createVehicle(body: VehicleRequest) {
  return backendApiClient.post<VehicleDto>("vehicles", body);
}

export function updateVehicle(id: number, body: VehicleRequest) {
  return backendApiClient.put<VehicleDto>(`vehicles/${id}`, body);
}

export function uploadVehicleImage(file: File): Promise<unknown> {
  const form = new FormData();
  form.append("file", file);
  return backendApiClient.post<unknown>("media/vehicle", form);
}

export function getStaff(params: { search?: string; page: number; pageSize: number }) {
  return backendApiClient.get<PagedResult<StaffDto>>("staff", params);
}

export function createStaff(body: CreateStaffRequest) {
  return backendApiClient.post<StaffDto>("staff", body);
}

export function getStaffById(id: number) {
  return backendApiClient.get<StaffDto>(`staff/${id}`);
}

export function updateStaff(id: number, body: UpdateStaffRequest) {
  return backendApiClient.put<StaffDto>(`staff/${id}`, body);
}

export function deleteStaff(id: number) {
  return backendApiClient.delete<void>(`staff/${id}`);
}

export function getDashboardData(params: { from?: string; to?: string } = {}) {
  return backendApiClient.get<unknown>("dashboard", params);
}

export function deleteVehicle(id: number) {
  return backendApiClient.delete<void>(`vehicles/${id}`);
}
