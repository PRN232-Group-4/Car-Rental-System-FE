export type AdminStatusTone = "success" | "warning" | "danger" | "info" | "neutral";

// Keep mappings exact and domain-specific: "inactive" must never match "active",
// and a renting vehicle (occupied) differs from an active rental (in service).
const statusTones = {
  activity: { active: "success", inactive: "neutral" },
  vehicle: { active: "success", available: "success", rented: "info", renting: "info", maintenance: "warning", unavailable: "neutral", inactive: "neutral" },
  rental: { active: "success", pending: "warning", pre_inspection: "info", renting: "success", overdue: "danger", post_inspection: "info", completed: "neutral", cancelled: "danger", expired: "danger" },
  maintenance: { scheduled: "info", in_progress: "warning", completed: "success", verified: "success", cancelled: "neutral" },
  license: { approved: "success", pending: "warning", expiring: "warning", rejected: "danger", expired: "danger", incomplete: "neutral" },
  shift: { active: "success", scheduled: "info", completed: "neutral", cancelled: "danger" },
  report: { new: "warning", pending: "warning", in_progress: "info", investigating: "info", resolved: "success", rejected: "danger", dismissed: "danger" },
  review: { visible: "success", published: "success", hidden: "neutral", reported: "warning" },
  payment: { pending: "warning", unpaid: "warning", paid: "success", requested: "info", refunded: "neutral", rejected: "danger", cancelled: "neutral", failed: "danger" },
} satisfies Record<string, Record<string, AdminStatusTone>>;

export type AdminStatusDomain = keyof typeof statusTones;

export const adminStatusToneClasses: Record<AdminStatusTone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-sunken text-ink-2",
};

export function getAdminStatusTone(domain: AdminStatusDomain, status: string | null | undefined): AdminStatusTone {
  const key = status?.trim().toLowerCase() ?? "";
  const tones: Record<string, AdminStatusTone> | undefined = (statusTones as Record<string, Record<string, AdminStatusTone>>)[domain];
  if (!tones) return "neutral";
  return Object.hasOwn(tones, key) ? tones[key] : "neutral";
}
