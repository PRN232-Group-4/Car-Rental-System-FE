import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/StatusBadge";

describe("StatusBadge component", () => {
  it("renders default Vietnamese label for standard statuses", () => {
    const { rerender } = render(<StatusBadge status="available" />);
    expect(screen.getByText("Sẵn sàng")).toBeInTheDocument();

    rerender(<StatusBadge status="rented" />);
    expect(screen.getByText("Đang thuê")).toBeInTheDocument();

    rerender(<StatusBadge status="maintenance" />);
    expect(screen.getByText("Bảo dưỡng")).toBeInTheDocument();

    rerender(<StatusBadge status="active" />);
    expect(screen.getByText("Đang hoạt động")).toBeInTheDocument();
  });

  it("renders custom label when provided", () => {
    render(<StatusBadge status="available" label="Xe trống" />);
    expect(screen.getByText("Xe trống")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(<StatusBadge status="unavailable">Ngưng phục vụ</StatusBadge>);
    expect(screen.getByText("Ngưng phục vụ")).toBeInTheDocument();
  });
});
