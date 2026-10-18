import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "@/components/ui/FormField";

describe("FormField component", () => {
  it("renders label and binds htmlFor to input id", () => {
    render(
      <FormField label="Họ và tên" htmlFor="fullName">
        <input id="fullName" placeholder="Nhập họ và tên" />
      </FormField>,
    );

    const label = screen.getByText("Họ và tên");
    expect(label).toBeInTheDocument();
    expect(label.closest("label")).toHaveAttribute("for", "fullName");
    expect(screen.getByPlaceholderText("Nhập họ và tên")).toBeInTheDocument();
  });

  it("automatically generates matching id and binds to child when htmlFor is omitted", () => {
    render(
      <FormField label="Địa chỉ liên hệ">
        <input placeholder="Nhập địa chỉ của bạn" />
      </FormField>,
    );

    const label = screen.getByText("Địa chỉ liên hệ").closest("label");
    const input = screen.getByPlaceholderText("Nhập địa chỉ của bạn");
    const generatedId = label?.getAttribute("for");

    expect(generatedId).toBeTruthy();
    expect(input).toHaveAttribute("id", generatedId);
    expect(screen.getByLabelText("Địa chỉ liên hệ")).toBe(input);
  });

  it("propagates provided htmlFor as id to child input if child lacks id", () => {
    render(
      <FormField label="Tên người nhận" htmlFor="receiver-name">
        <input placeholder="Họ và tên người nhận" />
      </FormField>,
    );

    const input = screen.getByPlaceholderText("Họ và tên người nhận");
    expect(input).toHaveAttribute("id", "receiver-name");
    expect(screen.getByLabelText("Tên người nhận")).toBe(input);
  });

  it("displays required asterisk when required is true", () => {
    render(
      <FormField label="Email" htmlFor="email" required>
        <input id="email" type="email" />
      </FormField>,
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays helperText, injects aria-describedby, and omits aria-invalid when valid", () => {
    render(
      <FormField
        label="Số điện thoại"
        htmlFor="phone"
        helperText="Định dạng 10 số (VD: 0901234567)"
      >
        <input id="phone" />
      </FormField>,
    );

    expect(
      screen.getByText("Định dạng 10 số (VD: 0901234567)"),
    ).toBeInTheDocument();

    const input = screen.getByLabelText("Số điện thoại");
    expect(input).toHaveAttribute("aria-describedby", "phone-helper");
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("displays error with role alert, injects aria-invalid=true and aria-describedby, and suppresses helperText", () => {
    render(
      <FormField
        label="Số điện thoại"
        htmlFor="phone"
        helperText="Định dạng 10 số"
        error="Số điện thoại không hợp lệ"
      >
        <input id="phone" />
      </FormField>,
    );

    const errorEl = screen.getByRole("alert");
    expect(errorEl).toHaveTextContent("Số điện thoại không hợp lệ");
    expect(errorEl).toHaveAttribute("id", "phone-error");
    expect(screen.queryByText("Định dạng 10 số")).not.toBeInTheDocument();

    const input = screen.getByLabelText("Số điện thoại");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "phone-error");
  });

  it("injects id and a11y attributes into the primary control inside a Fragment", () => {
    render(
      <FormField label="Ghi chú" error="Bắt buộc nhập">
        <>
          <textarea placeholder="Nhập ghi chú" />
        </>
      </FormField>,
    );

    const label = screen.getByText("Ghi chú").closest("label");
    const textarea = screen.getByPlaceholderText("Nhập ghi chú");
    const forAttr = label?.getAttribute("for");

    expect(forAttr).toBeTruthy();
    expect(textarea).toHaveAttribute("id", forAttr);
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAttribute("aria-describedby", `${forAttr}-error`);
  });

  it("only injects id into the primary control when multiple children exist", () => {
    render(
      <FormField label="Tải ảnh" htmlFor="upload-image">
        <input type="file" data-testid="file-input" />
        <span data-testid="extra-info">Tối đa 5MB</span>
      </FormField>,
    );

    expect(screen.getByTestId("file-input")).toHaveAttribute("id", "upload-image");
    expect(screen.getByTestId("extra-info")).not.toHaveAttribute("id");
  });

  it("merges existing child aria-describedby with helper and error ids", () => {
    const { rerender } = render(
      <FormField label="Email" htmlFor="email-input" helperText="Email công ty">
        <input id="email-input" aria-describedby="custom-tooltip" />
      </FormField>,
    );

    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-describedby", "custom-tooltip email-input-helper");

    rerender(
      <FormField label="Email" htmlFor="email-input" helperText="Email công ty" error="Email đã tồn tại">
        <input id="email-input" aria-describedby="custom-tooltip" />
      </FormField>,
    );

    expect(input).toHaveAttribute("aria-describedby", "custom-tooltip email-input-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });
});
