import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";

interface TestItem {
  id: number;
  name: string;
  role: string;
}

const testColumns: ColumnDef<TestItem>[] = [
  {
    accessorKey: "name",
    header: "Tên",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: (info) => info.getValue(),
  },
];

const testData: TestItem[] = [
  { id: 1, name: "Nguyễn Văn A", role: "Quản trị viên" },
  { id: 2, name: "Trần Thị B", role: "Nhân viên" },
];

describe("DataTable component", () => {
  it("renders table with caption, headers, and rows", () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        caption="Danh sách người dùng"
      />,
    );

    expect(screen.getByText("Danh sách người dùng")).toBeInTheDocument();
    expect(screen.getByText("Tên")).toBeInTheDocument();
    expect(screen.getByText("Vai trò")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("Trần Thị B")).toBeInTheDocument();
  });

  it("renders empty state message when data is empty", () => {
    render(
      <DataTable
        columns={testColumns}
        data={[]}
        caption="Bảng rỗng"
        emptyTitle="Không có dữ liệu hiển thị"
      />,
    );

    expect(screen.getByText("Không có dữ liệu hiển thị")).toBeInTheDocument();
  });

  it("renders skeleton rows when loading is true", () => {
    const { container } = render(
      <DataTable
        columns={testColumns}
        data={testData}
        caption="Bảng đang tải"
        loading={true}
      />,
    );

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    // Data rows should not be rendered while loading
    expect(screen.queryByText("Nguyễn Văn A")).not.toBeInTheDocument();
  });

  it("calls onRowClick when a row is clicked", () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        caption="Bảng bấm hàng"
        onRowClick={onRowClick}
      />,
    );

    const rowItem = screen.getByText("Nguyễn Văn A");
    fireEvent.click(rowItem);
    expect(onRowClick).toHaveBeenCalledWith(testData[0]);
  });

  it("toggles column sorting direction and reorders rows on header click", () => {
    const unsortedData: TestItem[] = [
      { id: 1, name: "Bảo", role: "Nhân viên" },
      { id: 2, name: "An", role: "Quản trị viên" },
    ];

    render(
      <DataTable
        columns={testColumns}
        data={unsortedData}
        caption="Bảng sắp xếp người dùng"
      />,
    );

    const sortButton = screen.getByRole("button", { name: /Tên/i });
    const headerCell = sortButton.closest("th");

    // Initially column has aria-sort="none"
    expect(headerCell).toHaveAttribute("aria-sort", "none");

    // Verify initial row order: Bảo at row 1, An at row 2
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Bảo");
    expect(rows[2]).toHaveTextContent("An");

    // Click 1: toggle sort ascending
    fireEvent.click(sortButton);
    expect(headerCell).toHaveAttribute("aria-sort", "ascending");

    // An sorted to row 1, Bảo to row 2
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("An");
    expect(rows[2]).toHaveTextContent("Bảo");

    // Click 2: toggle sort descending
    fireEvent.click(sortButton);
    expect(headerCell).toHaveAttribute("aria-sort", "descending");

    // Bảo sorted to row 1, An to row 2
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Bảo");
    expect(rows[2]).toHaveTextContent("An");
  });

  it("triggers onSortingChange callback when sortable column header is clicked", () => {
    const onSortingChange = vi.fn();
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        caption="Bảng kiểm tra sự kiện sắp xếp"
        onSortingChange={onSortingChange}
      />,
    );

    const sortButton = screen.getByRole("button", { name: /Tên/i });
    fireEvent.click(sortButton);

    expect(onSortingChange).toHaveBeenCalledTimes(1);
  });
});
