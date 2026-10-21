import { describe, it, expect } from "vitest";
import { sanitizeUserRecord, getAdminUsers, getAdminUserById } from "@/features/admin/users/api";

describe("User adapter security", () => {
  it("strips sensitive fields without modifying the source record", () => {
    const record = { id: 1, email: "an@example.com", password: "secret", password_hash: "hash", passwordHash: "hash", access_token: "token", refresh_token: "refresh", otp: "123456", ticket: "ticket", salt: "salt", secret: "secret" };
    expect(sanitizeUserRecord(record)).toEqual({ id: 1, email: "an@example.com" });
    expect(record.password).toBe("secret");
  });
  it("does not fabricate users when the listing endpoint is absent", async () => {
    await expect(getAdminUsers({ page: 1, pageSize: 5 })).rejects.toMatchObject({ status: 501 });
    await expect(getAdminUserById(1)).rejects.toMatchObject({ status: 501 });
  });
});
