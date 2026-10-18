import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "@/components/ui/Pagination";

describe("Pagination component", () => {
  it("renders item counts and current page info accurately", () => {
    render(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={45}
        onPageChange={vi.fn()}
        itemName="xe"
      />,
    );

    expect(screen.getByText("11")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText(/xe/)).toBeInTheDocument();
  });

  it("calls onPageChange when clicking next and previous buttons", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={30}
        onPageChange={onPageChange}
      />,
    );

    const prevButton = screen.getByLabelText("Trang trước");
    fireEvent.click(prevButton);
    expect(onPageChange).toHaveBeenCalledWith(1);

    const nextButton = screen.getByLabelText("Trang tiếp theo");
    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables previous button on first page and next button on last page", () => {
    const { rerender } = render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={30}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Trang trước")).toBeDisabled();
    expect(screen.getByLabelText("Trang tiếp theo")).not.toBeDisabled();

    rerender(
      <Pagination
        page={3}
        pageSize={10}
        totalCount={30}
        onPageChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Trang trước")).not.toBeDisabled();
    expect(screen.getByLabelText("Trang tiếp theo")).toBeDisabled();
  });

  it("calls onPageSizeChange when selecting a new page size", () => {
    const onPageSizeChange = vi.fn();
    render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={50}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 20, 50]}
      />,
    );

    const select = screen.getByLabelText("Số mục mỗi trang");
    fireEvent.change(select, { target: { value: "20" } });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });
});
