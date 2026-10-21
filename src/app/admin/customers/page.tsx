"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FormSkeleton } from "@/components/ui/Skeleton";
import CustomerDirectory from "@/features/admin/CustomerDirectory";

function CustomersContent() {
  const params = useSearchParams();
  const status = params.get("licenseStatus") ?? "";
  return <CustomerDirectory key={status} initialLicenseStatus={status} />;
}

export default function CustomersPage() {
  return <Suspense fallback={<FormSkeleton label="Đang tải danh sách khách hàng..." fields={3} />}><CustomersContent /></Suspense>;
}
