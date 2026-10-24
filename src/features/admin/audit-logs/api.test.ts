import { describe, expect, it, vi, beforeEach } from "vitest";
import { AUDIT_ACTIONS, auditActionLabel, auditStatusLabel, getAuditLogs, toAuditLogQuery } from "./api";
import { backendApiClient } from "@/api/backend-api-client";

vi.mock("@/api/backend-api-client", () => ({
  backendApiClient: { get: vi.fn() },
}));

const get = vi.mocked(backendApiClient.get);

describe("audit log API contract", () => {
  beforeEach(() => vi.resetAllMocks());

  it("chỉ gửi action khi người dùng chọn một hành động cụ thể", () => {
    expect(toAuditLogQuery({ action: "all", page: 1 }).action).toBeUndefined();
    expect(toAuditLogQuery({ action: "" }).action).toBeUndefined();
    expect(toAuditLogQuery({ action: "role_assigned" }).action).toBe("role_assigned");
  });

  it("trim từ khóa và không gửi chuỗi rỗng", () => {
    expect(toAuditLogQuery({ search: "  admin@test.local  " }).search).toBe("admin@test.local");
    expect(toAuditLogQuery({ search: "   " }).search).toBeUndefined();
  });

  it("mặc định page=1 và pageSize=20, bỏ giá trị không hợp lệ", () => {
    expect(toAuditLogQuery()).toMatchObject({ page: 1, pageSize: 20 });
    expect(toAuditLogQuery({ page: 0, pageSize: 0 })).toMatchObject({ page: 1, pageSize: 20 });
    expect(toAuditLogQuery({ page: 3, pageSize: 50 })).toMatchObject({ page: 3, pageSize: 50 });
  });

  it("gọi đúng endpoint và giữ nguyên số trang do máy chủ trả về", async () => {
    get.mockResolvedValue({ items: [{ id: "AUD-1" }], page: 2, pageSize: 20, totalCount: 41 });

    const result = await getAuditLogs({ search: "huy", action: "account_locked", page: 2 });

    expect(get).toHaveBeenCalledWith("audit-logs", {
      search: "huy",
      action: "account_locked",
      page: 2,
      pageSize: 20,
    });
    expect(result).toMatchObject({ page: 2, pageSize: 20, totalCount: 41 });
    expect(result.items).toHaveLength(1);
  });

  it("không làm sập trang khi payload thiếu items hoặc totalCount", async () => {
    get.mockResolvedValue({} as never);

    const result = await getAuditLogs();

    expect(result).toEqual({ items: [], page: 1, pageSize: 20, totalCount: 0 });
  });

  it("bộ lọc chỉ chứa 5 action backend thực sự ghi", () => {
    expect(AUDIT_ACTIONS.map((item) => item.value)).toEqual([
      "role_assigned",
      "role_removed",
      "account_locked",
      "account_unlocked",
      "session_revoked",
    ]);
  });

  it("dịch nhãn hành động và trạng thái, không bịa nhãn cho giá trị lạ", () => {
    expect(auditActionLabel("role_removed")).toBe("Gỡ vai trò");
    expect(auditActionLabel("password_reset")).toBe("password_reset");
    expect(auditActionLabel(null)).toBe("—");
    expect(auditStatusLabel("success")).toBe("Thành công");
    expect(auditStatusLabel("blocked")).toBe("Bị chặn");
    expect(auditStatusLabel("warning")).toBe("warning");
    expect(auditStatusLabel(undefined)).toBe("—");
  });
});
