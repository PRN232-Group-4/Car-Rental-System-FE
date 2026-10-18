"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AuthGate } from "@/features/auth/AuthGate";
import { useSession } from "@/features/auth/context/AuthContext";
import {
  useAdminUser,
  useSetUserActive,
  useAssignRole,
  useRemoveRole,
  useRevokeUserSessions,
  useAdjustLoyalty,
  useReviewLicense,
} from "@/features/admin/users/hooks";
import { UserRoleDialog } from "@/features/admin/users/components/UserRoleDialog";
import { UserLockDialog } from "@/features/admin/users/components/UserLockDialog";
import { UserLoyaltyDialog } from "@/features/admin/users/components/UserLoyaltyDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatDate } from "@/lib/time";
import { Role } from "@/features/auth/roles";
import {
  User,
  ArrowLeft,
  Shield,
  KeyRound,
  FileCheck,
  Briefcase,
  Lock,
  Unlock,
  LogOut,
  Plus,
  Trash2,
  Award,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
} from "lucide-react";

type ActiveTab = "overview" | "roles" | "profiles" | "security";

function UserDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, hasRole } = useSession();

  const idParam = searchParams.get("id");
  const userId = idParam ? parseInt(idParam, 10) : 0;

  const isManagerOnly = useMemo(() => {
    return hasRole("Manager") && !hasRole("Admin");
  }, [hasRole]);

  const { data: user, isLoading, error } = useAdminUser(userId);

  const setUserActiveMutation = useSetUserActive();
  const assignRoleMutation = useAssignRole();
  const removeRoleMutation = useRemoveRole();
  const revokeSessionsMutation = useRevokeUserSessions();
  const adjustLoyaltyMutation = useAdjustLoyalty();
  const reviewLicenseMutation = useReviewLicense();

  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Modals state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [loyaltyDialogOpen, setLoyaltyDialogOpen] = useState(false);
  const [removingRole, setRemovingRole] = useState<Role | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded-xl bg-sunken animate-pulse" />
        <div className="h-40 rounded-3xl bg-surface animate-pulse" />
        <div className="h-96 rounded-3xl bg-surface animate-pulse" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="py-8">
        <ErrorState
          title="Không tìm thấy người dùng"
          message={error instanceof Error ? error.message : "Tài khoản không tồn tại hoặc đã bị xóa."}
          action={
            <Button variant="secondary" onClick={() => router.push("/admin/users")}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Quay lại danh sách</span>
            </Button>
          }
        />
      </div>
    );
  }

  const isSelf = currentUser?.email
    ? currentUser.email.toLowerCase() === user.email.toLowerCase()
    : false;

  const handleLockConfirm = async (reason?: string) => {
    await setUserActiveMutation.mutateAsync({
      userId: user.id,
      isActive: !user.isActive,
      reason,
      currentActorEmail: currentUser?.email || "Admin",
    });
  };

  const handleAssignRole = async (newRole: Role) => {
    await assignRoleMutation.mutateAsync({
      userId: user.id,
      role: newRole,
    });
  };

  const handleConfirmRemoveRole = async () => {
    if (!removingRole) return;
    await removeRoleMutation.mutateAsync({
      userId: user.id,
      role: removingRole,
      currentActorEmail: currentUser?.email,
    });
    setRemovingRole(null);
  };

  const handleRevokeSessions = async () => {
    if (window.confirm(`Thu hồi mọi phiên đăng nhập của người dùng ${user.fullName}?`)) {
      await revokeSessionsMutation.mutateAsync(user.id);
    }
  };

  const handleLicenseAction = async (status: "approved" | "rejected") => {
    if (!user.customer) return;
    await reviewLicenseMutation.mutateAsync({
      customerId: user.customer.id,
      status,
    });
  };

  const handleLoyaltyAdjust = async (points: number, reason: string) => {
    if (!user.customer) return;
    await adjustLoyaltyMutation.mutateAsync({
      customerId: user.customer.id,
      points,
      reason,
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Điều hướng quay lại */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/users")}
          className="text-ink-3 hover:text-ink cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span>Danh sách người dùng</span>
        </Button>
      </div>

      {/* 2. Thẻ hồ sơ tổng quan trên đầu trang */}
      <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-e1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-line bg-canvas font-mono text-2xl font-black text-primary shadow-xs">
              {user.fullName
                .split(" ")
                .map((n) => n[0])
                .slice(-2)
                .join("")
                .toUpperCase() || <User className="w-8 h-8 text-ink-3" />}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">
                  {user.fullName}
                </h1>
                <StatusBadge
                  status={user.isActive ? "approved" : "rejected"}
                  label={user.isActive ? "Hoạt động" : "Đã khóa"}
                />
                {isSelf && (
                  <span className="rounded-full bg-primary-tint px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                    Tài khoản của bạn
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-ink-3">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{user.phone}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Tham gia: {formatDate(user.createdAt, "dd/MM/yyyy")}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Nút hành động chính (Ẩn khi Manager chỉ đọc) */}
          {!isManagerOnly && (
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant={user.isActive ? "danger" : "primary"}
                size="md"
                onClick={() => setLockDialogOpen(true)}
                disabled={isSelf && user.isActive}
                title={isSelf ? "Không thể tự khóa tài khoản của mình" : undefined}
              >
                {user.isActive ? (
                  <>
                    <Lock className="w-4 h-4 mr-1.5" />
                    <span>Khóa tài khoản</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 mr-1.5" />
                    <span>Mở khóa tài khoản</span>
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={handleRevokeSessions}
                isLoading={revokeSessionsMutation.isPending}
                title="Thu hồi mọi phiên đăng nhập"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                <span>Thu hồi phiên</span>
              </Button>
            </div>
          )}
        </div>

        {/* Cảnh báo khóa tài khoản */}
        {!user.isActive && user.lockInfo && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger-bg/40 p-4 text-xs text-danger">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Tài khoản này đang bị khóa</p>
              <p>Lý do: {user.lockInfo.reason || "Không có lý do chi tiết"}</p>
              <p className="font-mono text-[11px] text-danger/80">
                Khóa bởi: {user.lockInfo.by || "Admin"} • {user.lockInfo.at ? formatDate(user.lockInfo.at, "HH:mm dd/MM/yyyy") : "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Dải Tabs điều hướng */}
      <div className="flex border-b border-line gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-ink-3 hover:text-ink"
          }`}
        >
          <User className="w-4 h-4" />
          <span>Tổng quan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "roles"
              ? "border-primary text-primary"
              : "border-transparent text-ink-3 hover:text-ink"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Vai trò ({user.roles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profiles")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "profiles"
              ? "border-primary text-primary"
              : "border-transparent text-ink-3 hover:text-ink"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Hồ sơ tích hợp</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "security"
              ? "border-primary text-primary"
              : "border-transparent text-ink-3 hover:text-ink"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Bảo mật & Phiên</span>
        </button>
      </div>

      {/* 4. Nội dung từng Tab */}

      {/* TAB 1: TỔNG QUAN */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1 space-y-4">
            <h3 className="text-base font-bold text-ink border-b border-line pb-3">
              Thông tin tài khoản gốc
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-3">Mã tài khoản (User ID)</span>
                <span className="font-mono font-bold text-ink">#{user.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-3">Họ và tên</span>
                <span className="font-bold text-ink">{user.fullName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-3">Email đăng ký</span>
                <span className="font-mono text-ink">{user.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-3">Trạng thái xác minh Email</span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã xác minh</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-3">Số điện thoại</span>
                <span className="font-mono text-ink">{user.phone || "Chưa cập nhật"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-3">Giới tính</span>
                <span className="text-ink">{user.gender || "Chưa cập nhật"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1 space-y-4">
            <h3 className="text-base font-bold text-ink border-b border-line pb-3">
              Thời gian & Lần truy cập
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-3">Ngày tạo tài khoản</span>
                <span className="font-mono text-ink">{formatDate(user.createdAt, "HH:mm dd/MM/yyyy")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/60">
                <span className="text-ink-3">Lần đăng nhập gần nhất</span>
                <span className="font-mono text-ink">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt, "HH:mm dd/MM/yyyy") : "Chưa có dữ liệu"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-3">Trạng thái tài khoản</span>
                <span className={user.isActive ? "text-success font-bold" : "text-danger font-bold"}>
                  {user.isActive ? "Đang hoạt động" : "Đã bị vô hiệu hóa"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VAI TRÒ */}
      {activeTab === "roles" && (
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <h3 className="text-base font-bold text-ink">Danh sách vai trò & Quyền truy cập</h3>
              <p className="text-xs text-ink-3">
                Một tài khoản có thể đảm nhận nhiều vai trò để phục vụ nghiệp vụ vận hành và thuê xe.
              </p>
            </div>

            {!isManagerOnly && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setRoleDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Gán thêm vai trò</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.roles.map((role) => {
              const isAdmin = role === "Admin";
              const cannotRemove = isSelf && isAdmin;

              return (
                <div
                  key={role}
                  className="flex items-center justify-between rounded-xl border border-line bg-canvas p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-ink">{role}</span>
                      {isAdmin && (
                        <span className="rounded bg-primary-tint px-2 py-0.5 text-[10px] font-bold text-primary">
                          Toàn quyền
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-3">
                      {role === "Admin" && "Quản trị toàn quyền cấu hình, nhân sự và chính sách"}
                      {role === "Manager" && "Quản lý điều hành đội xe, trạm đón và xem báo cáo"}
                      {role === "Staff" && "Nhân viên giao nhận xe, kiểm tra tình trạng phương tiện"}
                      {role === "Driver" && "Tài xế nhận cuốc chuyến thuê có tài xế"}
                      {role === "Customer" && "Khách hàng cá nhân thuê xe trên ứng dụng"}
                      {role === "CustomerService" && "Chăm sóc khách hàng, duyệt giấy phép lái xe"}
                      {role === "Maintenance" && "Kỹ thuật viên bảo dưỡng xe định kỳ"}
                    </p>
                  </div>

                  {!isManagerOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={cannotRemove || user.roles.length <= 1}
                      onClick={() => setRemovingRole(role)}
                      className="text-danger hover:bg-danger-bg/40 cursor-pointer"
                      title={
                        cannotRemove
                          ? "Không thể tự gỡ vai trò Admin của mình"
                          : user.roles.length <= 1
                          ? "Người dùng phải có ít nhất 1 vai trò"
                          : `Gỡ vai trò ${role}`
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: HỒ SƠ TÍCH HỢP */}
      {activeTab === "profiles" && (
        <div className="space-y-6">
          {/* Hồ sơ khách hàng */}
          {user.customer ? (
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1 space-y-6">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-ink">Hồ sơ khách hàng</h3>
                    <p className="text-xs text-ink-3">Thông tin định danh GPLX và điểm thưởng hội viên</p>
                  </div>
                </div>

                {!isManagerOnly && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setLoyaltyDialogOpen(true)}
                  >
                    <Award className="w-4 h-4 mr-1.5 text-primary" />
                    <span>Điều chỉnh điểm thưởng</span>
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1 border-b border-line/60">
                    <span className="text-ink-3">Trạng thái GPLX</span>
                    <span
                      className={`font-bold capitalize ${
                        user.customer.licenseStatus === "approved"
                          ? "text-success"
                          : user.customer.licenseStatus === "pending"
                          ? "text-warning"
                          : "text-danger"
                      }`}
                    >
                      {user.customer.licenseStatus === "approved"
                        ? "Đã xác thực"
                        : user.customer.licenseStatus === "pending"
                        ? "Chờ xét duyệt"
                        : "Bị từ chối"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-line/60">
                    <span className="text-ink-3">Số giấy phép</span>
                    <span className="font-mono font-bold text-ink">
                      {user.customer.licenseNumber || "—"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-line/60">
                    <span className="text-ink-3">Hạng bằng</span>
                    <span className="font-mono text-ink">{user.customer.licenseType || "—"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-3">Ngày hết hạn</span>
                    <span className="font-mono text-ink">
                      {user.customer.licenseExpiry
                        ? formatDate(user.customer.licenseExpiry, "dd/MM/yyyy")
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Ảnh chụp GPLX */}
                <div>
                  <span className="text-xs font-semibold text-ink-3 block mb-2">Ảnh chụp GPLX:</span>
                  {user.customer.licenseImgUrl ? (
                    <div className="relative aspect-[3/2] w-full max-w-xs overflow-hidden rounded-xl border border-line bg-canvas">
                      <Image
                        src={user.customer.licenseImgUrl}
                        alt="Ảnh GPLX"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[3/2] w-full max-w-xs items-center justify-center rounded-xl border border-dashed border-line bg-canvas text-xs text-ink-3">
                      Chưa tải ảnh GPLX
                    </div>
                  )}
                </div>

                {/* Điểm thưởng & Phê duyệt */}
                <div className="rounded-xl border border-line bg-canvas p-4 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-ink-3">Điểm thưởng Thong Dong:</span>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-mono text-2xl font-black tabular-nums text-primary">
                        {(user.customer.loyaltyPoint || 0).toLocaleString("vi-VN")}
                      </span>
                      <span className="text-xs font-bold text-ink-3">điểm</span>
                    </div>
                  </div>

                  {!isManagerOnly && user.customer.licenseStatus === "pending" && (
                    <div className="space-y-2 pt-2 border-t border-line">
                      <span className="text-xs font-bold text-ink">Duyệt hồ sơ GPLX:</span>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleLicenseAction("approved")}
                          isLoading={reviewLicenseMutation.isPending}
                          className="flex-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          <span>Duyệt</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleLicenseAction("rejected")}
                          isLoading={reviewLicenseMutation.isPending}
                          className="flex-1"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          <span>Từ chối</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1 text-center py-8 text-xs text-ink-3">
              Người dùng này chưa có hồ sơ khách hàng.
            </div>
          )}

          {/* Hồ sơ nhân viên */}
          {user.staff ? (
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-ink">Hồ sơ nhân viên nội bộ</h3>
                    <p className="text-xs text-ink-3">Thông tin phòng ban, chi nhánh và chức danh vận hành</p>
                  </div>
                </div>

                <Link
                  href={`/admin/staffs/detail?id=${user.staff.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <span>Xem hồ sơ nhân sự</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="rounded-xl border border-line bg-canvas p-3">
                  <span className="text-xs text-ink-3 block">Phòng ban:</span>
                  <span className="font-bold text-ink">{user.staff.department || "—"}</span>
                </div>
                <div className="rounded-xl border border-line bg-canvas p-3">
                  <span className="text-xs text-ink-3 block">Cơ sở / Trạm trực:</span>
                  <span className="font-bold text-ink">{user.staff.facility || "—"}</span>
                </div>
                <div className="rounded-xl border border-line bg-canvas p-3">
                  <span className="text-xs text-ink-3 block">Đội tài xế:</span>
                  <span className="font-bold text-ink">
                    {user.staff.isDriver ? `Có (Đánh giá: ${user.staff.rating || 5.0}/5.0)` : "Không"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1 text-center py-8 text-xs text-ink-3">
              Người dùng này không thuộc đội ngũ nhân viên Thong Dong.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BẢO MẬT & PHIÊN */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-e1 space-y-6">
          <div className="border-b border-line pb-4">
            <h3 className="text-base font-bold text-ink">Kiểm soát an toàn & Phiên đăng nhập</h3>
            <p className="text-xs text-ink-3">
              Quản lý các thao tác khẩn cấp nhằm bảo vệ tài khoản khỏi các rủi ro xâm nhập.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-line p-4">
              <div>
                <span className="font-bold text-sm text-ink block">Thu hồi phiên hoạt động</span>
                <span className="text-xs text-ink-3">
                  Hủy toàn bộ cookie và refresh token đang hoạt động của người này trên các thiết bị.
                </span>
              </div>
              {!isManagerOnly && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRevokeSessions}
                  isLoading={revokeSessionsMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span>Thu hồi tất cả phiên</span>
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-line p-4">
              <div>
                <span className="font-bold text-sm text-ink block">Trạng thái khóa tài khoản</span>
                <span className="text-xs text-ink-3">
                  Khóa tài khoản sẽ chặn đăng nhập tức thì trên cả Web và Ứng dụng di động.
                </span>
              </div>
              {!isManagerOnly && (
                <Button
                  variant={user.isActive ? "danger" : "primary"}
                  size="sm"
                  onClick={() => setLockDialogOpen(true)}
                  disabled={isSelf && user.isActive}
                >
                  {user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialog Gán Vai Trò */}
      <UserRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        userId={user.id}
        userName={user.fullName}
        currentRoles={user.roles}
        isLoading={assignRoleMutation.isPending}
        onAssignRole={handleAssignRole}
      />

      {/* Dialog Khóa / Mở Khóa */}
      <UserLockDialog
        open={lockDialogOpen}
        onOpenChange={setLockDialogOpen}
        userId={user.id}
        userName={user.fullName}
        isCurrentlyActive={user.isActive}
        isLoading={setUserActiveMutation.isPending}
        onConfirm={handleLockConfirm}
      />

      {/* Dialog Điều Chỉnh Điểm Loyalty */}
      {user.customer && (
        <UserLoyaltyDialog
          open={loyaltyDialogOpen}
          onOpenChange={setLoyaltyDialogOpen}
          customerId={user.customer.id}
          customerName={user.fullName}
          currentPoints={user.customer.loyaltyPoint || 0}
          isLoading={adjustLoyaltyMutation.isPending}
          onAdjust={handleLoyaltyAdjust}
        />
      )}

      {/* Confirm Dialog Gỡ Vai Trò */}
      <ConfirmDialog
        open={Boolean(removingRole)}
        onOpenChange={(open) => !open && setRemovingRole(null)}
        title="Xác nhận gỡ vai trò"
        description={`Bạn có chắc chắn muốn thu hồi vai trò ${removingRole} khỏi người dùng ${user.fullName}?`}
        confirmLabel="Xác nhận gỡ"
        cancelLabel="Hủy"
        variant="danger"
        isPending={removeRoleMutation.isPending}
        onConfirm={handleConfirmRemoveRole}
      />
    </div>
  );
}

export default function AdminUserDetailPage() {
  return (
    <AuthGate allowedRoles={["Admin", "Manager"]}>
        <Suspense fallback={<div className="h-40 rounded-2xl bg-surface animate-pulse" />}>
          <UserDetailContent />
        </Suspense>
    </AuthGate>
  );
}
