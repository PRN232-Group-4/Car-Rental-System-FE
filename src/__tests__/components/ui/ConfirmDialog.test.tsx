import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

describe("ConfirmDialog component", () => {
  it("renders title, description, and action buttons when open is true", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Xóa phương tiện"
        description="Bạn có chắc chắn muốn xóa phương tiện này?"
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("Xóa phương tiện")).toBeInTheDocument();
    expect(
      screen.getByText("Bạn có chắc chắn muốn xóa phương tiện này?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Xác nhận xóa")).toBeInTheDocument();
    expect(screen.getByText("Hủy bỏ")).toBeInTheDocument();
  });

  it("does not render dialog content when open is false", () => {
    render(
      <ConfirmDialog
        open={false}
        onOpenChange={vi.fn()}
        title="Tiêu đề ẩn"
        description="Mô tả ẩn"
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByText("Tiêu đề ẩn")).not.toBeInTheDocument();
  });

  it("calls onConfirm when clicking confirm button", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Xác nhận thao tác"
        description="Mô tả xác nhận"
        confirmLabel="Đồng ý"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByText("Đồng ý"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(false) when clicking cancel button", () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Xác nhận thao tác"
        description="Mô tả xác nhận"
        cancelLabel="Hủy"
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Hủy"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
