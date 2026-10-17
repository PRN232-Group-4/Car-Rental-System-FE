import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "@/components/ui/Modal";

describe("Modal component", () => {
  it("renders visible title, description, and children when title is provided", () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        title="Chi tiết đơn thuê"
        description="Mã đơn #12345"
      >
        <p>Nội dung chi tiết</p>
      </Modal>,
    );

    expect(screen.getByText("Chi tiết đơn thuê")).toBeInTheDocument();
    expect(screen.getByText("Mã đơn #12345")).toBeInTheDocument();
    expect(screen.getByText("Nội dung chi tiết")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Đóng cửa sổ" })).toBeInTheDocument();
  });

  it("renders accessible fallback title with sr-only class when title is omitted", () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()}>
        <p>Modal không có tiêu đề trực quan</p>
      </Modal>,
    );

    const fallbackTitle = screen.getByText("Cửa sổ thông tin");
    expect(fallbackTitle).toBeInTheDocument();
    expect(fallbackTitle).toHaveClass("sr-only");
    expect(screen.queryByRole("button", { name: "Đóng cửa sổ" })).not.toBeInTheDocument();
  });

  it("does not render modal content when open is false", () => {
    render(
      <Modal open={false} onOpenChange={vi.fn()} title="Modal ẩn">
        <p>Nội dung không hiển thị</p>
      </Modal>,
    );

    expect(screen.queryByText("Modal ẩn")).not.toBeInTheDocument();
    expect(screen.queryByText("Nội dung không hiển thị")).not.toBeInTheDocument();
  });

  it("calls onOpenChange(false) when clicking close button", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open={true} onOpenChange={onOpenChange} title="Modal kiểm tra đóng">
        <p>Nội dung</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Đóng cửa sổ" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders footer when footer prop is provided", () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        title="Modal với Footer"
        footer={<button type="button">Hành động footer</button>}
      >
        <p>Nội dung chính</p>
      </Modal>,
    );

    expect(screen.getByText("Hành động footer")).toBeInTheDocument();
  });
});
