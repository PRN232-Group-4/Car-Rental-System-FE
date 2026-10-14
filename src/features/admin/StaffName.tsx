"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { getStaffById } from "./api";

export default function StaffName({ staffId, name }: { staffId?: number | null; name?: string | null }) {
  const { hasRole } = useAuth();
  const canRead = hasRole("admin") || hasRole("manager");
  const knownName = name?.trim();
  const staff = useQuery({
    queryKey: ["admin-staff", staffId],
    queryFn: () => getStaffById(staffId!),
    enabled: staffId != null && !knownName && canRead,
    staleTime: 60_000,
    retry: false,
  });

  if (knownName) return <>{knownName}</>;
  if (staffId == null) return <>Chưa gán</>;
  if (!canRead) return <>Đã phân công</>;
  if (staff.isPending) return <>Đang tải tên nhân viên...</>;
  if (staff.isError) return <>Không tải được tên nhân viên</>;
  return <>{staff.data.fullName?.trim() || staff.data.email?.trim() || "Chưa có tên nhân viên"}</>;
}
