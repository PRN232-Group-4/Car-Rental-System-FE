import type { Metadata } from "next";
import FleetRegistry from "@/features/admin/transit-desk/FleetRegistry";

export const metadata: Metadata = {
  title: "Sổ phương tiện · Transit Desk | Thong Dong",
};

export default function VehiclesPage() {
  return <FleetRegistry />;
}
