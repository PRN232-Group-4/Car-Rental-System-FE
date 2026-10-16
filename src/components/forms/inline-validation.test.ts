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

describe("ApiResponse envelope (BE thực tế)", () => {
  it("maps field errors nested under error.errors", () => {
    expect(mapValidationErrors({
      code: 400, status: "error", is_success: false, data: null,
      message: "One or more validation errors occurred.",
      error: { status: 400, title: "One or more validation errors occurred.", errors: { "RentalRequest.EndTime": ["Thời gian trả xe phải sau thời gian nhận xe."], Unknown: ["Lỗi chung"] } },
    }, ["endTime"])).toEqual({
      errors: { endTime: "Thời gian trả xe phải sau thời gian nhận xe." },
      remaining: ["Lỗi chung"],
    });
  });
});
