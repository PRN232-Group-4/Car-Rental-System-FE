import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiProblemError } from "@/api/api-client";
import {
  getStaffList,
  getStaffById,
  createStaff,
  updateStaff,
  updateStaffLicense,
  getDriverSchedules,
  getAssignableDrivers,
  assignDriverToRental,
  getStaffDepartments,
  getStaffFacilities,
} from "./api";
import type {
  StaffFilterParams,
  CreateStaffInput,
  UpdateStaffInput,
  UpdateLicenseInput,
  AssignDriverInput,
} from "./types";

export const STAFF_QUERY_KEYS = {
  all: ["staffs"] as const,
  lists: () => [...STAFF_QUERY_KEYS.all, "list"] as const,
  list: (params: StaffFilterParams) => [...STAFF_QUERY_KEYS.lists(), params] as const,
  details: () => [...STAFF_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...STAFF_QUERY_KEYS.details(), id] as const,
  departments: ["departments"] as const,
  facilities: ["facilities"] as const,
  schedules: ["driver-schedules"] as const,
  schedule: (params: { from?: string; to?: string; driverStaffId?: number; facilityId?: number }) =>
    [...STAFF_QUERY_KEYS.schedules, params] as const,
  assignableDrivers: (rentalId: number) => ["assignable-drivers", rentalId] as const,
};

export function useStaffs(params: StaffFilterParams = {}) {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.list(params),
    queryFn: () => getStaffList(params),
    staleTime: 30_000,
  });
}

export function useStaff(id: number) {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.detail(id),
    queryFn: () => getStaffById(id),
    enabled: Boolean(id && id > 0),
    staleTime: 60_000,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.departments,
    queryFn: getStaffDepartments,
    staleTime: 5 * 60_000,
  });
}

export function useFacilities() {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.facilities,
    queryFn: getStaffFacilities,
    staleTime: 5 * 60_000,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStaffInput) => createStaff(input),
    onSuccess: (newStaff) => {
      queryClient.invalidateQueries({ queryKey: ["operational-drivers"] });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.all });
      toast.success(`Đã tạo thành công hồ sơ nhân viên ${newStaff.fullName}`);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể tạo hồ sơ nhân viên mới";
      toast.error(msg);
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStaffInput) => updateStaff(input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["operational-drivers"] });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.detail(updated.id) });
      toast.success("Cập nhật thông tin nhân viên thành công");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể cập nhật hồ sơ nhân viên";
      toast.error(msg);
    },
  });
}

export function useUpdateStaffLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateLicenseInput) => updateStaffLicense(input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["operational-drivers"] });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.detail(updated.id) });
      toast.success("Đã cập nhật giấy phép lái xe thành công");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể cập nhật giấy phép lái xe";
      toast.error(msg);
    },
  });
}

export function useDriverSchedules(params: {
  from?: string;
  to?: string;
  driverStaffId?: number;
  facilityId?: number;
} = {}) {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.schedule(params),
    queryFn: () => getDriverSchedules(params),
    staleTime: 15_000,
  });
}

export function useAssignableDrivers(rentalId: number) {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.assignableDrivers(rentalId),
    queryFn: () => getAssignableDrivers(rentalId),
    enabled: Boolean(rentalId && rentalId > 0),
    staleTime: 10_000,
  });
}

export function useAssignDriver() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignDriverInput) => assignDriverToRental(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_QUERY_KEYS.schedules });
      toast.success("Gán tài xế cho đơn thuê thành công");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể điều phối tài xế cho đơn này";
      toast.error(msg);
    },
  });
}
