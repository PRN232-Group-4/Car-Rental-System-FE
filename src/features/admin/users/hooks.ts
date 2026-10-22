import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getAdminUsers,
  getAdminUserById,
  setUserActiveStatus,
  assignUserRole,
  removeUserRole,
  revokeUserSessions,
  adjustCustomerLoyalty,
  reviewCustomerLicense,
} from "./api";
import { UserFilterParams } from "./types";
import { Role } from "@/features/auth/roles";
import { ApiProblemError } from "@/api/api-client";
import { ADMIN_NAVIGATION_COUNTS_KEY } from "@/features/admin/navigation-counts";

export const USER_QUERY_KEYS = {
  all: ["admin", "users"] as const,
  list: (params: UserFilterParams) => ["admin", "users", "list", params] as const,
  detail: (id: number) => ["admin", "users", "detail", id] as const,
};

export function useAdminUsers(params: UserFilterParams = {}) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.list(params),
    queryFn: () => getAdminUsers(params),
    staleTime: 30 * 1000,
  });
}

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: USER_QUERY_KEYS.detail(id),
    queryFn: () => getAdminUserById(id),
    enabled: Boolean(id && id > 0),
    staleTime: 60 * 1000,
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      isActive,
      reason,
      currentActorId,
      currentActorEmail,
    }: {
      userId: number;
      isActive: boolean;
      reason?: string;
      currentActorId?: number;
      currentActorEmail?: string;
    }) =>
      setUserActiveStatus({
        userId,
        isActive,
        reason,
        currentActorId,
        currentActorEmail,
      }),
    onSuccess: async (updated) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: ["admin", "staff-account-options"] }),
        queryClient.invalidateQueries({ queryKey: ["staffs"] }),
        queryClient.invalidateQueries({ queryKey: ["operational-drivers"] }),
      ]);
      toast.success(
        updated.isActive
          ? `Đã mở khóa tài khoản ${updated.fullName}`
          : `Đã khóa tài khoản ${updated.fullName}`
      );
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể thay đổi trạng thái tài khoản";
      toast.error(msg);
    },
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
      currentActorId,
    }: {
      userId: number;
      role: Role;
      currentActorId?: number;
    }) => assignUserRole({ userId, role, currentActorId }),
    onSuccess: async (updated, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: ["admin", "staff-account-options"] }),
        queryClient.invalidateQueries({ queryKey: ["staffs"] }),
        queryClient.invalidateQueries({ queryKey: ["operational-drivers"] }),
      ]);
      toast.success(`Đã thêm vai trò ${variables.role} cho ${updated.fullName}`);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể gán vai trò cho người dùng";
      toast.error(msg);
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
      currentActorId,
      currentActorEmail,
    }: {
      userId: number;
      role: Role;
      currentActorId?: number;
      currentActorEmail?: string;
    }) => removeUserRole({ userId, role, currentActorId, currentActorEmail }),
    onSuccess: async (updated, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: ["admin", "staff-account-options"] }),
        queryClient.invalidateQueries({ queryKey: ["staffs"] }),
        queryClient.invalidateQueries({ queryKey: ["operational-drivers"] }),
      ]);
      toast.success(`Đã gỡ vai trò ${variables.role} khỏi ${updated.fullName}`);
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể gỡ vai trò người dùng";
      toast.error(msg);
    },
  });
}

export function useRevokeUserSessions() {
  return useMutation({
    mutationFn: (userId: number) => revokeUserSessions(userId),
    onSuccess: () => {
      toast.success("Đã thu hồi mọi phiên đăng nhập của người dùng");
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể thu hồi phiên đăng nhập";
      toast.error(msg);
    },
  });
}

export function useAdjustLoyalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      points,
      reason,
      idempotencyKey,
    }: {
      customerId: number;
      points: number;
      reason: string;
      idempotencyKey: string;
    }) => adjustCustomerLoyalty({ customerId, points, reason, idempotencyKey }),
    onSuccess: async (updated, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: ["admin", "staff-account-options"] }),
        queryClient.invalidateQueries({ queryKey: ["staffs"] }),
      ]);
      toast.success(
        `Đã ${variables.points > 0 ? "cộng" : "trừ"} ${Math.abs(variables.points)} điểm cho ${
          updated.fullName
        }`
      );
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể điều chỉnh điểm thưởng";
      toast.error(msg);
    },
  });
}

export function useReviewLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      status,
    }: {
      customerId: number;
      status: "approved" | "rejected";
    }) => reviewCustomerLicense({ customerId, status }),
    onSuccess: async (updated, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ADMIN_NAVIGATION_COUNTS_KEY }),
        queryClient.invalidateQueries({ queryKey: ["admin-customers"] }),
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEYS.all }),
        queryClient.invalidateQueries({ queryKey: ["admin", "staff-account-options"] }),
        queryClient.invalidateQueries({ queryKey: ["staffs"] }),
      ]);
      toast.success(
        variables.status === "approved"
          ? `Đã phê duyệt GPLX cho ${updated.fullName}`
          : `Đã từ chối GPLX của ${updated.fullName}`
      );
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof ApiProblemError
          ? err.detail || err.message
          : "Không thể cập nhật trạng thái GPLX";
      toast.error(msg);
    },
  });
}
