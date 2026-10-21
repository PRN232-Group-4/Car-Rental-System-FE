"use client";
import { useSearchParams } from "next/navigation";
import RentalWorkspaceV4 from "@/features/admin/transit-desk/RentalWorkspaceV4";
import AdminRentalsPage from "./AdminRentalsPage";
export default function RentalAdminEntry() {
  const params = useSearchParams();
  return params.get("view") === "list" ? <div className="h-full overflow-y-auto p-4 sm:p-6"><AdminRentalsPage /></div> : <RentalWorkspaceV4 />;
}
