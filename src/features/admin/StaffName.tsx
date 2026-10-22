"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { getStaffById } from "./api";
import { Skeleton } from "@/components/ui/Skeleton";

export default function StaffName({ staffId, name, email }: { staffId?: number | null; name?: string | null; email?: string | null }) {
  const { hasRole } = useAuth();
  const canRead = hasRole("admin") || hasRole("manager");
  const knownName = name?.trim();
  const knownEmail = email?.trim() || (knownName?.includes("@") ? knownName : undefined);
  const staff = useQuery({
    queryKey: ["admin-staff", staffId],
    queryFn: () => getStaffById(staffId!),
    enabled: staffId != null && !knownEmail && canRead,
    staleTime: 60_000,
    retry: false,
  });

  if (knownEmail) return <>{knownEmail}</>;
  if (staffId == null) return <>Chưa gán</>;
  if (!canRead) return <>{knownName || "Đã phân công"}</>;
  if (staff.isPending) return <span role="status" aria-label="Đang tải tên nhân viên..."><Skeleton className="h-4 w-28 max-w-full" /></span>;
  if (staff.isError) return <>Không tải được tên nhân viên</>;
  return <>{staff.data.email?.trim() || "Chưa cập nhật email nhân viên"}</>;
}
