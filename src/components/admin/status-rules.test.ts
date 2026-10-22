import { describe, expect, it } from "vitest";
import { adminStatusToneClasses, getAdminStatusTone } from "./status-rules";

describe("Admin semantic status rules", () => {
  it("uses the green success tokens for active and available states", () => {
    for (const domain of ["activity", "vehicle", "rental", "shift"] as const) {
      expect(getAdminStatusTone(domain, " Active ")).toBe("success");
    }
    expect(getAdminStatusTone("vehicle", "available")).toBe("success");
    expect(getAdminStatusTone("license", "approved")).toBe("success");
    expect(adminStatusToneClasses.success).toBe("bg-success-bg text-success");
  });

  it("never infers success from substrings, translated labels or unknown values", () => {
    for (const value of ["inactive", "not_active", "deactivated", "unavailable", "Đang hoạt động", "__proto__", "constructor", null, undefined, ""]) {
      expect(getAdminStatusTone("activity", value)).toBe("neutral");
    }
  });

  it("keeps business domain meanings distinct", () => {
    expect(getAdminStatusTone("vehicle", "renting")).toBe("info");
    expect(getAdminStatusTone("rental", "renting")).toBe("success");
    expect(getAdminStatusTone("rental", "completed")).toBe("neutral");
    expect(getAdminStatusTone("maintenance", "completed")).toBe("success");
    expect(getAdminStatusTone("license", "pending")).toBe("warning");
    expect(getAdminStatusTone("license", "rejected")).toBe("danger");
    expect(getAdminStatusTone("license", "expired")).toBe("danger");
    expect(getAdminStatusTone("rental", "cancelled")).toBe("danger");
    expect(getAdminStatusTone("rental", "overdue")).toBe("danger");
    expect(getAdminStatusTone("vehicle", "maintenance")).toBe("warning");
  });
});
