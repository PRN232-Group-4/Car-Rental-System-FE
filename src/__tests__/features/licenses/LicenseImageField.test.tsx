import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import LicenseImageField, { validateLicenseImageFile } from "@/features/licenses/components/LicenseImageField";

const createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
const revokeObjectURL = vi.fn();

function Harness({ existingUrl = null }: { existingUrl?: string | null }) {
  const validation = useInlineValidation();
  const [file, setFile] = useState<File | null>(null);
  return (
    <ValidatedForm validation={validation} onSubmit={() => {}}>
      <LicenseImageField
        label="Ảnh chụp mặt trước giấy phép lái xe *"
        name="file"
        inputId="customer-license-image"
        validation={validation}
        value={file}
        onChange={setFile}
        existingUrl={existingUrl}
      />
    </ValidatedForm>
  );
}

const fileInput = () => document.querySelector<HTMLInputElement>('[name="file"]')!;
const photo = (name = "license.png", type = "image/png") => new File(["image"], name, { type });

describe("LicenseImageField", () => {
  beforeEach(() => {
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
    // jsdom không cung cấp createObjectURL/revokeObjectURL.
    vi.stubGlobal("URL", class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("hiển thị ảnh xem trước ngay sau khi chọn tệp, không cần gửi biểu mẫu", () => {
    render(<Harness />);
    expect(screen.queryByAltText("Ảnh giấy phép lái xe")).not.toBeInTheDocument();

    fireEvent.change(fileInput(), { target: { files: [photo()] } });

    const preview = screen.getByAltText("Ảnh giấy phép lái xe");
    expect(preview).toHaveAttribute("src", "blob:license.png");
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(screen.getByText("Ảnh mới đã chọn")).toBeVisible();
  });

  it("hiển thị lại ảnh đã có trên hồ sơ khi chưa chọn ảnh mới", () => {
    render(<Harness existingUrl="https://cdn.example.test/license.jpg" />);
    expect(screen.getByAltText("Ảnh giấy phép lái xe")).toHaveAttribute("src", "https://cdn.example.test/license.jpg");
    expect(screen.getByText("Ảnh đang lưu trên hồ sơ")).toBeVisible();
    expect(screen.getByRole("button", { name: "Chọn ảnh mới" })).toBeVisible();
  });

  it("cho phép bỏ ảnh đã chọn trước khi gửi và giải phóng object URL", () => {
    render(<Harness existingUrl="https://cdn.example.test/old.png" />);
    fireEvent.change(fileInput(), { target: { files: [photo()] } });
    expect(screen.getByText("Ảnh mới đã chọn")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Bỏ ảnh đã chọn" }));

    expect(screen.getByText("Ảnh đang lưu trên hồ sơ")).toBeVisible();
    expect(screen.getByAltText("Ảnh giấy phép lái xe")).toHaveAttribute("src", "https://cdn.example.test/old.png");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:license.png");
  });

  it("giải phóng object URL khi component unmount", () => {
    const view = render(<Harness />);
    fireEvent.change(fileInput(), { target: { files: [photo()] } });
    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:license.png");
  });

  it("chặn định dạng không được hỗ trợ và báo lỗi ngay dưới vùng tải", () => {
    render(<Harness />);
    fireEvent.change(fileInput(), { target: { files: [new File(["pdf"], "license.pdf", { type: "application/pdf" })] } });

    expect(fileInput()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/phải là tệp JPG, PNG, GIF hoặc WEBP/)).toBeVisible();
    expect(screen.queryByAltText("Ảnh giấy phép lái xe")).not.toBeInTheDocument();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("chặn ảnh vượt quá 5 MB và nêu rõ dung lượng", () => {
    render(<Harness />);
    const oversized = photo();
    Object.defineProperty(oversized, "size", { value: 6 * 1024 * 1024 });
    fireEvent.change(fileInput(), { target: { files: [oversized] } });

    expect(fileInput()).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText(/6\.00 MB vượt quá giới hạn 5 MB/)).toBeVisible();
    expect(screen.queryByAltText("Ảnh giấy phép lái xe")).not.toBeInTheDocument();
  });

  it("xóa lỗi khi người dùng chọn lại ảnh hợp lệ", () => {
    render(<Harness />);
    fireEvent.change(fileInput(), { target: { files: [new File(["x"], "a.txt", { type: "text/plain" })] } });
    expect(fileInput()).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(fileInput(), { target: { files: [photo()] } });
    expect(fileInput()).toHaveAttribute("aria-invalid", "false");
  });

  it("mở ảnh phóng to trong hộp thoại và đóng lại được", () => {
    render(<Harness />);
    fireEvent.change(fileInput(), { target: { files: [photo()] } });

    fireEvent.click(screen.getByRole("button", { name: "Xem chi tiết" }));
    expect(screen.getByAltText("Ảnh giấy phép lái xe phóng to")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Đóng xem ảnh" }));
    expect(screen.queryByAltText("Ảnh giấy phép lái xe phóng to")).not.toBeInTheDocument();
  });

  it("nhận đúng các định dạng ảnh backend chấp nhận", () => {
    for (const type of ["image/jpeg", "image/png", "image/gif", "image/webp"]) {
      expect(validateLicenseImageFile(photo("license", type))).toBeUndefined();
    }
    expect(validateLicenseImageFile(new File(["x"], "license.svg", { type: "image/svg+xml" }))).toMatch(/JPG, PNG, GIF hoặc WEBP/);
  });
});
