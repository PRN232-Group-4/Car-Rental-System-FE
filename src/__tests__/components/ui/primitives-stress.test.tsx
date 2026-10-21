import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField } from "@/components/ui/FormField";

interface TestRow {
  id: string;
  title: string;
  count: number;
  status?: string | null;
}

const mockColumns: ColumnDef<TestRow>[] = [
  {
    accessorKey: "title",
    header: "Tiêu đề",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "count",
    header: "Số lượng",
    cell: (info) => String(info.getValue()),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: (info) => (info.getValue() as string | null) ?? "N/A",
  },
];

describe("Adversarial Stress Test: DataTable", () => {
  it("handles empty dataset with custom empty title, description, and action node", () => {
    const onAction = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={[]}
        caption="Bảng dữ liệu trống"
        emptyTitle="Không có bản ghi nào"
        emptyDescription="Vui lòng thử lại với bộ lọc khác hoặc tạo mới"
        emptyAction={
          <button type="button" onClick={onAction}>
            Thêm mới
          </button>
        }
      />,
    );

    expect(screen.getByText("Không có bản ghi nào")).toBeInTheDocument();
    expect(
      screen.getByText("Vui lòng thử lại với bộ lọc khác hoặc tạo mới"),
    ).toBeInTheDocument();
    const actionBtn = screen.getByRole("button", { name: "Thêm mới" });
    expect(actionBtn).toBeInTheDocument();
    fireEvent.click(actionBtn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("handles table with zero columns and empty data without crash", () => {
    const { container } = render(
      <DataTable columns={[]} data={[]} caption="Bảng không có cột" />,
    );
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(screen.getByText("Không có dữ liệu")).toBeInTheDocument();
  });

  it("safely escapes XSS injection strings in data, headers, and caption", () => {
    const maliciousPayload = `<script>alert('xss')</script><img src=x onerror=alert(1)>`;
    const xssColumns: ColumnDef<TestRow>[] = [
      {
        accessorKey: "title",
        header: `Cột <script>alert('header')</script>`,
        cell: (info) => info.getValue(),
      },
    ];
    const xssData: TestRow[] = [
      { id: "1", title: maliciousPayload, count: 0 },
    ];

    const { container } = render(
      <DataTable
        columns={xssColumns}
        data={xssData}
        caption={`Caption ${maliciousPayload}`}
      />,
    );

    // No script tags should exist in the DOM
    expect(container.querySelectorAll("script")).toHaveLength(0);
    // Malicious string must be rendered as escaped text
    expect(screen.getByText(maliciousPayload)).toBeInTheDocument();
    expect(
      screen.getByText(`Caption ${maliciousPayload}`),
    ).toBeInTheDocument();
  });

  it("renders large dataset (500 rows) with diverse and null values reliably", () => {
    const largeData: TestRow[] = Array.from({ length: 500 }, (_, idx) => ({
      id: `id-${idx}`,
      title: `Item #${idx} - \u202E\u0000Special \uD83D\uDE97`,
      count: idx * 10,
      status: idx % 3 === 0 ? null : idx % 3 === 1 ? "Active" : "Archived",
    }));

    const { container } = render(
      <DataTable
        columns={mockColumns}
        data={largeData}
        caption="Bảng lớn 500 dòng"
      />,
    );

    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(500);
    expect(screen.getByText("Item #0 - \u202E\u0000Special \uD83D\uDE97")).toBeInTheDocument();
  });

  it("handles prototype pollution probe keys in rows", () => {
    const pollutedData = [
      JSON.parse('{"id": "p1", "title": "Normal", "count": 1, "__proto__": {"polluted": true}}'),
      JSON.parse('{"id": "p2", "title": "Constructor", "count": 2, "constructor": {"name": "fake"}}'),
    ];

    render(
      <DataTable
        columns={mockColumns}
        data={pollutedData}
        caption="Bảng kiểm tra prototype pollution"
      />,
    );

    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.getByText("Constructor")).toBeInTheDocument();
    expect((Object.prototype as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it("toggles sorting states correctly in uncontrolled mode", () => {
    const sortData: TestRow[] = [
      { id: "1", title: "Gamma", count: 30 },
      { id: "2", title: "Alpha", count: 10 },
      { id: "3", title: "Beta", count: 20 },
    ];

    const { container } = render(
      <DataTable
        columns={mockColumns}
        data={sortData}
        caption="Bảng sắp xếp"
      />,
    );

    const sortButton = screen.getByRole("button", { name: /Tiêu đề/i });
    expect(sortButton).toBeInTheDocument();

    // Initial order: Gamma, Alpha, Beta
    let rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveTextContent("Gamma");

    // Click 1: asc -> Alpha, Beta, Gamma
    fireEvent.click(sortButton);
    rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveTextContent("Alpha");
    expect(rows[1]).toHaveTextContent("Beta");
    expect(rows[2]).toHaveTextContent("Gamma");

    // Click 2: desc -> Gamma, Beta, Alpha
    fireEvent.click(sortButton);
    rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveTextContent("Gamma");
    expect(rows[1]).toHaveTextContent("Beta");
    expect(rows[2]).toHaveTextContent("Alpha");
  });

  it("handles row clicks and stops propagation from nested buttons", () => {
    const onRowClick = vi.fn();
    const onInnerButtonClick = vi.fn();

    const actionColumns: ColumnDef<TestRow>[] = [
      {
        accessorKey: "title",
        header: "Tiêu đề",
        cell: (info) => info.getValue(),
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: () => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInnerButtonClick();
            }}
          >
            Hành động con
          </button>
        ),
      },
    ];

    const singleRowData: TestRow[] = [{ id: "1", title: "Dòng 1", count: 5 }];

    render(
      <DataTable
        columns={actionColumns}
        data={singleRowData}
        caption="Bảng tương tác con"
        onRowClick={onRowClick}
      />,
    );

    const innerBtn = screen.getByRole("button", { name: "Hành động con" });
    fireEvent.click(innerBtn);
    expect(onInnerButtonClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();

    // Now click the row itself outside the button
    const cell = screen.getByText("Dòng 1");
    fireEvent.click(cell);
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(singleRowData[0]);
  });
});

describe("Adversarial Stress Test: Pagination", () => {
  it("handles totalCount = 0 correctly by showing 0-0 of 0 items and disabled navigation", () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <Pagination
        page={1}
        pageSize={10}
        totalCount={0}
        onPageChange={onPageChange}
        itemName="xe"
      />,
    );

    // Check count text content
    const summarySpan = container.querySelector(".text-td-muted > span");
    expect(summarySpan?.textContent?.replace(/\s+/g, " ")).toContain("Hiển thị 0–0 trong 0 xe");
    const prevBtn = screen.getByLabelText("Trang trước");
    const nextBtn = screen.getByLabelText("Trang tiếp theo");
    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeDisabled();
  });

  it("clamps out-of-bounds page numbers (negative, 0, or huge numbers)", () => {
    const onPageChange = vi.fn();
    const { rerender, container } = render(
      <Pagination
        page={-5}
        pageSize={10}
        totalCount={50}
        onPageChange={onPageChange}
      />,
    );

    // Negative page is clamped to 1: firstResult = 1, lastResult = 10
    const summarySpan = container.querySelector(".text-td-muted > span");
    expect(summarySpan?.textContent?.replace(/\s+/g, " ")).toContain("Hiển thị 1–10 trong 50 mục");
    expect(screen.getByLabelText("Trang trước")).toBeDisabled();

    // Page = 999999 is clamped to pageCount (5)
    rerender(
      <Pagination
        page={999999}
        pageSize={10}
        totalCount={50}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByLabelText("Trang tiếp theo")).toBeDisabled();
    const summaryClamped = container.querySelector(".text-td-muted > span");
    expect(summaryClamped?.textContent?.replace(/\s+/g, " ")).toContain("Hiển thị 41–50 trong 50 mục");
  });

  it("renders ellipsis patterns correctly across all page positions (Case A, Case B, Case C)", () => {
    const onPageChange = vi.fn();

    // Case A: currentPage <= 4 in 20 pages -> [1, 2, 3, 4, 5, 'ellipsis', 20]
    const { rerender, container } = render(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={200}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Trang 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang 5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang 20" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trang 6" })).not.toBeInTheDocument();
    // 1 ellipsis in DOM
    expect(container.querySelectorAll("span[aria-hidden='true']")).toHaveLength(1);

    // Case B: currentPage >= 20 - 3 = 17 -> [1, 'ellipsis', 16, 17, 18, 19, 20]
    rerender(
      <Pagination
        page={18}
        pageSize={10}
        totalCount={200}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Trang 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang 16" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang 20" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Trang 5" })).not.toBeInTheDocument();
    expect(container.querySelectorAll("span[aria-hidden='true']")).toHaveLength(1);

    // Case C: currentPage = 10 (middle) -> [1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]
    rerender(
      <Pagination
        page={10}
        pageSize={10}
        totalCount={200}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Trang 1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang 9" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang 10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang 11" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang 20" })).toBeInTheDocument();
    // 2 ellipses in DOM
    expect(container.querySelectorAll("span[aria-hidden='true']")).toHaveLength(2);
  });

  it("disables all controls when loading is true", () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();

    render(
      <Pagination
        page={2}
        pageSize={10}
        totalCount={50}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        loading={true}
      />,
    );

    expect(screen.getByLabelText("Trang trước")).toBeDisabled();
    expect(screen.getByLabelText("Trang tiếp theo")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Trang 1" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Trang 2" })).toBeDisabled();
    expect(screen.getByLabelText("Số mục mỗi trang")).toBeDisabled();
  });
});

describe("Adversarial Stress Test: ConfirmDialog", () => {
  it("safely displays long strings, special unicode characters, and XSS probe without executing", () => {
    const xssTitle = `<script>alert('dialog-title')</script> Xóa dữ liệu`;
    const xssDesc = `<img src=x onerror=alert('dialog-desc')> Bạn có chắc không?`;

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title={xssTitle}
        description={xssDesc}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText(xssTitle)).toBeInTheDocument();
    expect(screen.getByText(xssDesc)).toBeInTheDocument();
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });

  it("locks buttons and disables dismissal during isPending state", () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    const { rerender } = render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Thao tác đang xử lý"
        description="Vui lòng chờ giây lát"
        confirmLabel="Tiến hành"
        cancelLabel="Hủy bỏ"
        isPending={true}
        onConfirm={onConfirm}
      />,
    );

    const cancelBtn = screen.getByRole("button", { name: "Hủy bỏ" });
    const confirmBtn = screen.getByRole("button", { name: "Tiến hành" });

    expect(cancelBtn).toBeDisabled();
    expect(confirmBtn).toBeDisabled();

    // Clicking cancel while pending must not trigger onOpenChange
    fireEvent.click(cancelBtn);
    expect(onOpenChange).not.toHaveBeenCalled();

    // Clicking confirm while pending must not trigger onConfirm
    fireEvent.click(confirmBtn);
    expect(onConfirm).not.toHaveBeenCalled();

    // Transitioning isPending to false restores buttons
    rerender(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Thao tác đã sẵn sàng"
        description="Đã sẵn sàng"
        confirmLabel="Tiến hành"
        cancelLabel="Hủy bỏ"
        isPending={false}
        onConfirm={onConfirm}
      />,
    );

    expect(cancelBtn).not.toBeDisabled();
    expect(confirmBtn).not.not.toBeNull();
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("handles rapid open and close lifecycle toggles cleanly", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ConfirmDialog
        open={false}
        onOpenChange={onOpenChange}
        title="Hội thoại chớp"
        description="Mô tả nhanh"
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByText("Hội thoại chớp")).not.toBeInTheDocument();

    for (let i = 0; i < 5; i++) {
      rerender(
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange}
          title="Hội thoại chớp"
          description="Mô tả nhanh"
          onConfirm={vi.fn()}
        />,
      );
      expect(screen.getByText("Hội thoại chớp")).toBeInTheDocument();

      rerender(
        <ConfirmDialog
          open={false}
          onOpenChange={onOpenChange}
          title="Hội thoại chớp"
          description="Mô tả nhanh"
          onConfirm={vi.fn()}
        />,
      );
      expect(screen.queryByText("Hội thoại chớp")).not.toBeInTheDocument();
    }
  });

  it("catches or tolerates async rejection in onConfirm without crashing React", async () => {
    const rejectingConfirm = vi.fn().mockRejectedValue(new Error("Async failure"));
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Thử nghiệm lỗi async"
        description="Mô tả lỗi"
        confirmLabel="Gửi lỗi"
        onConfirm={rejectingConfirm}
      />,
    );

    const btn = screen.getByRole("button", { name: "Gửi lỗi" });
    fireEvent.click(btn);
    expect(rejectingConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.getByText("Thử nghiệm lỗi async")).toBeInTheDocument();
    });
  });
});

describe("Adversarial Stress Test: FormField", () => {
  it("renders with extreme label lengths and XSS payloads safely", () => {
    const massiveLabel = "A".repeat(2000) + "<script>alert('form')</script>";
    const massiveHelper = "B".repeat(2000) + "<img src=x onerror=alert(2)>";

    render(
      <FormField label={massiveLabel} helperText={massiveHelper}>
        <input id="test-input" />
      </FormField>,
    );

    expect(screen.getByText(massiveLabel)).toBeInTheDocument();
    expect(screen.getByText(massiveHelper)).toBeInTheDocument();
    expect(document.querySelectorAll("script")).toHaveLength(0);
  });

  it("manages error over helperText precedence and aria-alert transitions", () => {
    const { rerender } = render(
      <FormField
        label="Tên tài khoản"
        htmlFor="username"
        helperText="Chỉ chứa chữ thường và số"
      >
        <input id="username" />
      </FormField>,
    );

    expect(screen.getByText("Chỉ chứa chữ thường và số")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // Introduce error
    rerender(
      <FormField
        label="Tên tài khoản"
        htmlFor="username"
        helperText="Chỉ chứa chữ thường và số"
        error="Tên tài khoản đã tồn tại"
      >
        <input id="username" />
      </FormField>,
    );

    expect(screen.queryByText("Chỉ chứa chữ thường và số")).not.toBeInTheDocument();
    const alertEl = screen.getByRole("alert");
    expect(alertEl).toHaveTextContent("Tên tài khoản đã tồn tại");

    // Clear error
    rerender(
      <FormField
        label="Tên tài khoản"
        htmlFor="username"
        helperText="Chỉ chứa chữ thường và số"
        error={undefined}
      >
        <input id="username" />
      </FormField>,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByText("Chỉ chứa chữ thường và số")).toBeInTheDocument();
  });

  it("handles complex icon, badge, and required indicator combinations", () => {
    render(
      <FormField
        label="Mật khẩu bảo mật"
        htmlFor="password"
        required
        icon={<span data-testid="lock-icon">Lock</span>}
        badge={<span data-testid="strength-badge">Mạnh</span>}
      >
        <input id="password" type="password" />
      </FormField>,
    );

    expect(screen.getByTestId("lock-icon")).toBeInTheDocument();
    expect(screen.getByTestId("strength-badge")).toBeInTheDocument();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("binds label to input via htmlFor and isolates unlinked inputs", () => {
    render(
      <div>
        <FormField label="Email liên hệ" htmlFor="user-email">
          <input id="user-email" placeholder="email@test.com" />
        </FormField>
        <FormField label="Ghi chú thêm">
          <input id="unlinked-input" placeholder="Ghi chú" />
        </FormField>
      </div>,
    );

    const emailLabel = screen.getByText("Email liên hệ").closest("label");
    expect(emailLabel).toHaveAttribute("for", "user-email");

    const noteLabel = screen.getByText("Ghi chú thêm").closest("label");
    // When htmlFor is not provided, fieldId falls back to generatedId
    expect(noteLabel?.getAttribute("for")).toBeTruthy();
    expect(noteLabel?.getAttribute("for")).not.toBe("unlinked-input");
  });
});

describe("Adversarial Stress Test: Controlled DataTable & Manual Sorting", () => {
  it("triggers onSortingChange callback in manualSorting mode", () => {
    const onSortingChange = vi.fn();
    render(
      <DataTable
        columns={mockColumns}
        data={[{ id: "1", title: "Test", count: 1 }]}
        caption="Bảng manual sort"
        manualSorting={true}
        sorting={[{ id: "title", desc: false }]}
        onSortingChange={onSortingChange}
      />,
    );

    const sortButton = screen.getByRole("button", { name: /Tiêu đề/i });
    fireEvent.click(sortButton);
    expect(onSortingChange).toHaveBeenCalledTimes(1);
  });
});

describe("Adversarial Stress Test: Multiple Modal Lifecycle", () => {
  it("manages multiple dialogs open simultaneously and sequential lifecycle closures", () => {
    const onOpenChange1 = vi.fn();
    const onOpenChange2 = vi.fn();

    const { rerender } = render(
      <div>
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange1}
          title="Dialog Thứ Nhất"
          description="Nội dung 1"
          onConfirm={vi.fn()}
        />
        <ConfirmDialog
          open={false}
          onOpenChange={onOpenChange2}
          title="Dialog Thứ Hai"
          description="Nội dung 2"
          onConfirm={vi.fn()}
        />
      </div>,
    );

    expect(screen.getByText("Dialog Thứ Nhất")).toBeInTheDocument();
    expect(screen.queryByText("Dialog Thứ Hai")).not.toBeInTheDocument();

    // Open second dialog as well
    rerender(
      <div>
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange1}
          title="Dialog Thứ Nhất"
          description="Nội dung 1"
          onConfirm={vi.fn()}
        />
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange2}
          title="Dialog Thứ Hai"
          description="Nội dung 2"
          onConfirm={vi.fn()}
        />
      </div>,
    );

    expect(screen.getByText("Dialog Thứ Nhất")).toBeInTheDocument();
    expect(screen.getByText("Dialog Thứ Hai")).toBeInTheDocument();

    // Close first dialog
    rerender(
      <div>
        <ConfirmDialog
          open={false}
          onOpenChange={onOpenChange1}
          title="Dialog Thứ Nhất"
          description="Nội dung 1"
          onConfirm={vi.fn()}
        />
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange2}
          title="Dialog Thứ Hai"
          description="Nội dung 2"
          onConfirm={vi.fn()}
        />
      </div>,
    );

    expect(screen.queryByText("Dialog Thứ Nhất")).not.toBeInTheDocument();
    expect(screen.getByText("Dialog Thứ Hai")).toBeInTheDocument();
  });
});
