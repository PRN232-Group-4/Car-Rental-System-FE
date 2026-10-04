import type { Metadata } from "next";
import DriverShifts from "@/features/driver-portal/DriverShifts";

export const metadata: Metadata = {
  title: "Ca làm việc | Cổng tài xế Thong Dong",
};

export default function DriverShiftsPage() {
  return <DriverShifts />;
}
