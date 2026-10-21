import type { VehicleDto } from "./api";

/** Responsibility is supplied by current maintenance records, never inferred from staff history. */
export default function VehicleMaintenanceTechnicians({ vehicle }: { vehicle: Pick<VehicleDto, "status" | "maintenanceTechnicianEmails"> }) {
  if (vehicle.status !== "maintenance") return null;
  const emails = [...new Set((vehicle.maintenanceTechnicianEmails ?? []).filter((email) => typeof email === "string" && email.trim()).map((email) => email.trim()))];
  return <div className="min-w-0 space-y-1 text-xs">
    <span className="block font-semibold text-td-muted">Kỹ thuật viên phụ trách</span>
    {emails.length ? emails.map((email) => <span key={email} className="block break-all text-td-ink">{email}</span>) : <span className="block text-td-muted">Chưa phân công kỹ thuật viên</span>}
  </div>;
}
