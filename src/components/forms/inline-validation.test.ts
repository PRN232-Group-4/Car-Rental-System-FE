import { describe, expect, it } from "vitest";
import { mapValidationErrors } from "./inline-validation";

describe("backend field validation", () => {
  it("maps nested PascalCase and snake_case properties without losing unrelated errors", () => {
    expect(mapValidationErrors({ errors: {
      "request.Detail.FullName": ["Tên không hợp lệ"],
      phone_number: ["Số không hợp lệ", "Cần kiểm tra lại"],
      Unknown: ["Lỗi chung"],
    } }, ["fullName", "phoneNumber"])).toEqual({
      errors: { fullName: "Tên không hợp lệ", phoneNumber: "Số không hợp lệ Cần kiểm tra lại" },
      remaining: ["Lỗi chung"],
    });
  });
  it("uses explicit API aliases for license fields", () => {
    expect(mapValidationErrors({ errors: { Number: ["Số GPLX đã tồn tại"] } }, ["licenseNumber"], { number: "licenseNumber" }).errors)
      .toEqual({ licenseNumber: "Số GPLX đã tồn tại" });
  });
  it("does not treat a network/general error as a field error", () => {
    expect(mapValidationErrors({ detail: "Không thể kết nối" }, ["email"])).toEqual({ errors: {}, remaining: [] });
  });
});
