import { describe, it, expect } from "vitest";
import { setUserActiveStatus, assignUserRole, removeUserRole, revokeUserSessions } from "@/features/admin/users/api";

describe("Account administration fails closed without a deployed API", () => {
  it("never simulates locking the current or last admin", async () => {
    await expect(setUserActiveStatus({ userId: 1, isActive: false, currentActorId: 1 })).rejects.toMatchObject({ status: 501 });
    await expect(setUserActiveStatus({ userId: 2, isActive: false, reason: "Vi phạm quy chế" })).rejects.toMatchObject({ status: 501 });
  });
  it("never simulates granting or removing roles", async () => {
    await expect(assignUserRole({ userId: 2, role: "Admin" })).rejects.toMatchObject({ status: 501 });
    await expect(removeUserRole({ userId: 1, role: "Admin", currentActorId: 1 })).rejects.toMatchObject({ status: 501 });
  });
  it("does not claim that sessions were revoked", async () => {
    await expect(revokeUserSessions(2)).rejects.toMatchObject({ status: 501 });
  });
});
