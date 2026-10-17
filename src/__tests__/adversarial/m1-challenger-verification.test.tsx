import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { FormField } from "@/components/ui/FormField";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";

describe("Empirical Challenger: FormField", () => {
  describe("1. Fragment handling and traversal", () => {
    it("handles deeply nested fragments and injects id + a11y props onto leaf input", () => {
      render(
        <FormField label="Tên người dùng" error="Lỗi tên">
          <>
            <>
              <>
                <input placeholder="deep-input" />
              </>
            </>
          </>
        </FormField>,
      );

      const input = screen.getByPlaceholderText("deep-input");
      const label = screen.getByText("Tên người dùng").closest("label");
      const fieldId = label?.getAttribute("for");

      expect(fieldId).toBeTruthy();
      expect(input).toHaveAttribute("id", fieldId);
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", `${fieldId}-error`);
      expect(screen.getByLabelText("Tên người dùng")).toBe(input);
    });

    it("handles fragments with non-element children (null, boolean, string) preceding input", () => {
      render(
        <FormField label="Ghi chú fragment">
          <>
            {false}
            {null}
            {"Ghi chú đi kèm"}
            <textarea placeholder="frag-textarea" />
          </>
        </FormField>,
      );

      const textarea = screen.getByPlaceholderText("frag-textarea");
      const label = screen.getByText("Ghi chú fragment").closest("label");
      const fieldId = label?.getAttribute("for");

      expect(fieldId).toBeTruthy();
      expect(textarea).toHaveAttribute("id", fieldId);
      expect(screen.getByLabelText("Ghi chú fragment")).toBe(textarea);
    });

    it("handles sibling elements inside fragment: only primary control receives injected props", () => {
      render(
        <FormField label="Mã OTP" htmlFor="otp-input" helperText="Nhập 6 số">
          <>
            <input placeholder="000000" data-testid="otp-control" />
            <span data-testid="otp-timer">Hết hạn sau 60s</span>
          </>
        </FormField>,
      );

      const input = screen.getByTestId("otp-control");
      const span = screen.getByTestId("otp-timer");

      expect(input).toHaveAttribute("id", "otp-input");
      expect(input).toHaveAttribute("aria-describedby", "otp-input-helper");
      expect(span).not.toHaveAttribute("id");
      expect(span).not.toHaveAttribute("aria-describedby");
    });
  });

  describe("2. Multi-children forms and primary control resolution", () => {
    it("targets first valid element when multiple inputs are provided", () => {
      render(
        <FormField label="Khoảng giá" htmlFor="price-min">
          <input data-testid="min-input" placeholder="Từ" />
          <input data-testid="max-input" placeholder="Đến" />
        </FormField>,
      );

      expect(screen.getByTestId("min-input")).toHaveAttribute("id", "price-min");
      expect(screen.getByTestId("max-input")).not.toHaveAttribute("id");
    });

    it("investigates behavior when non-input element precedes input", () => {
      render(
        <FormField label="Số tiền" htmlFor="amount-field">
          <span data-testid="currency-symbol">VNĐ</span>
          <input data-testid="amount-input" placeholder="0" />
        </FormField>,
      );

      // Observing where the id is injected:
      const span = screen.getByTestId("currency-symbol");
      const input = screen.getByTestId("amount-input");
      
      // Documenting exact behavior for analysis
      expect(span).toHaveAttribute("id", "amount-field");
      expect(input).not.toHaveAttribute("id");
    });
  });

  describe("3. Accessible name resolution via screen.getByLabelText with and without htmlFor", () => {
    it("resolves accessible name for <input> with htmlFor provided", () => {
      render(
        <FormField label="Email khách hàng" htmlFor="cust-email">
          <input placeholder="cust@test.com" />
        </FormField>,
      );
      expect(screen.getByLabelText("Email khách hàng")).toBeInTheDocument();
      expect(screen.getByLabelText("Email khách hàng")).toHaveAttribute("id", "cust-email");
    });

    it("resolves accessible name for <input> without htmlFor (auto-generated ID)", () => {
      render(
        <FormField label="Email khách hàng tự sinh">
          <input placeholder="auto@test.com" />
        </FormField>,
      );
      const input = screen.getByLabelText("Email khách hàng tự sinh");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "auto@test.com");
    });

    it("resolves accessible name for <textarea> without htmlFor", () => {
      render(
        <FormField label="Mô tả sự cố">
          <textarea placeholder="Chi tiết sự cố..." />
        </FormField>,
      );
      const textarea = screen.getByLabelText("Mô tả sự cố");
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName.toLowerCase()).toBe("textarea");
    });

    it("resolves accessible name for <select> without htmlFor", () => {
      render(
        <FormField label="Loại xe thuê">
          <select>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
          </select>
        </FormField>,
      );
      const select = screen.getByLabelText("Loại xe thuê");
      expect(select).toBeInTheDocument();
      expect(select.tagName.toLowerCase()).toBe("select");
    });

    it("resolves accessible name when label has required asterisk and icon", () => {
      render(
        <FormField
          label="Mật khẩu"
          required
          icon={<span data-testid="pwd-icon">key</span>}
        >
          <input type="password" />
        </FormField>,
      );
      // In DOM Testing Library, label textContent includes child nodes ("key Mật khẩu *")
      // With exact: false or regex, it resolves correctly
      const input = screen.getByLabelText(/Mật khẩu/);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "password");
    });

    it("verifies behavior when child has pre-existing explicit id differing from htmlFor or omitted htmlFor", () => {
      render(
        <FormField label="Tài khoản liên kết">
          <input id="my-explicit-id" placeholder="pre-existing" />
        </FormField>,
      );

      const label = screen.getByText("Tài khoản liên kết").closest("label");
      const forAttr = label?.getAttribute("for");
      const input = screen.getByPlaceholderText("pre-existing");

      // Child retains explicit id
      expect(input).toHaveAttribute("id", "my-explicit-id");
      // Label has generated id
      expect(forAttr).toBeTruthy();
      expect(forAttr).not.toBe("my-explicit-id");
      // Demonstrates that when child specifies explicit id without matching htmlFor on FormField,
      // getByLabelText will fail or not link
      expect(() => screen.getByLabelText("Tài khoản liên kết")).toThrow();
    });
  });

  describe("4. Existing aria-describedby merging and edge cases", () => {
    it("preserves child aria-describedby when neither error nor helperText is provided", () => {
      render(
        <FormField label="Mã bảo mật" htmlFor="security-code">
          <input id="security-code" aria-describedby="tooltip-info" />
        </FormField>,
      );

      const input = screen.getByLabelText("Mã bảo mật");
      expect(input).toHaveAttribute("aria-describedby", "tooltip-info");
    });

    it("merges multiple space-separated IDs in child aria-describedby", () => {
      render(
        <FormField
          label="Mã pin"
          htmlFor="pin"
          helperText="6 chữ số bí mật"
        >
          <input id="pin" aria-describedby="desc-1 desc-2" />
        </FormField>,
      );

      const input = screen.getByLabelText("Mã pin");
      expect(input).toHaveAttribute("aria-describedby", "desc-1 desc-2 pin-helper");
    });
  });
});

describe("Empirical Challenger: Modal", () => {
  describe("Accessibility and jsdom behavior", () => {
    it("renders fallback title with sr-only class and resolves accessible name via getByRole('dialog', { name })", () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()}>
          <p>Nội dung modal không có tiêu đề</p>
        </Modal>,
      );

      // Verify DOM node
      const srOnlyTitle = screen.getByText("Cửa sổ thông tin");
      expect(srOnlyTitle).toBeInTheDocument();
      expect(srOnlyTitle).toHaveClass("sr-only");

      // Verify accessible name on dialog role in jsdom
      const dialog = screen.getByRole("dialog", { name: "Cửa sổ thông tin" });
      expect(dialog).toBeInTheDocument();
    });

    it("renders custom title and resolves accessible name", () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()} title="Xác nhận đặt cọc">
          <p>Số tiền cọc: 5.000.000đ</p>
        </Modal>,
      );

      const dialog = screen.getByRole("dialog", { name: "Xác nhận đặt cọc" });
      expect(dialog).toBeInTheDocument();
    });

    it("renders fallback description with sr-only when description is provided without title", () => {
      render(
        <Modal
          open={true}
          onOpenChange={vi.fn()}
          description="Mô tả ẩn cho trình đọc màn hình"
        >
          <p>Nội dung</p>
        </Modal>,
      );

      const srOnlyDesc = screen.getByText("Mô tả ẩn cho trình đọc màn hình");
      expect(srOnlyDesc).toBeInTheDocument();
      expect(srOnlyDesc).toHaveClass("sr-only");
    });
  });
});

describe("Empirical Challenger: DataTable Sorting Behavior", () => {
  interface VehicleRow {
    id: string;
    model: string;
    price: number;
  }

  const columns: ColumnDef<VehicleRow>[] = [
    {
      accessorKey: "model",
      header: "Mẫu xe",
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "price",
      header: "Giá thuê/ngày",
      cell: (info) => `${info.getValue()}đ`,
    },
  ];

  const vehicleData: VehicleRow[] = [
    { id: "1", model: "Toyota Vios", price: 800000 },
    { id: "2", model: "Honda City", price: 750000 },
    { id: "3", model: "Hyundai Accent", price: 700000 },
  ];

  it("cycles through string column sorting: unsorted -> ascending -> descending -> unsorted", () => {
    render(
      <DataTable
        columns={columns}
        data={vehicleData}
        caption="Bảng giá xe"
      />,
    );

    const modelSortButton = screen.getByRole("button", { name: /Mẫu xe/i });
    const headerCell = modelSortButton.closest("th");

    // Initial state: unsorted
    expect(headerCell).toHaveAttribute("aria-sort", "none");
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Toyota Vios");
    expect(rows[2]).toHaveTextContent("Honda City");
    expect(rows[3]).toHaveTextContent("Hyundai Accent");

    // Click 1: ascending (Honda City -> Hyundai Accent -> Toyota Vios)
    fireEvent.click(modelSortButton);
    expect(headerCell).toHaveAttribute("aria-sort", "ascending");
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Honda City");
    expect(rows[2]).toHaveTextContent("Hyundai Accent");
    expect(rows[3]).toHaveTextContent("Toyota Vios");

    // Click 2: descending (Toyota Vios -> Hyundai Accent -> Honda City)
    fireEvent.click(modelSortButton);
    expect(headerCell).toHaveAttribute("aria-sort", "descending");
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Toyota Vios");
    expect(rows[2]).toHaveTextContent("Hyundai Accent");
    expect(rows[3]).toHaveTextContent("Honda City");

    // Click 3: clears sorting back to none
    fireEvent.click(modelSortButton);
    expect(headerCell).toHaveAttribute("aria-sort", "none");
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Toyota Vios");
    expect(rows[2]).toHaveTextContent("Honda City");
    expect(rows[3]).toHaveTextContent("Hyundai Accent");
  });

  it("cycles through numeric column sorting: unsorted -> descending -> ascending -> unsorted", () => {
    render(
      <DataTable
        columns={columns}
        data={vehicleData}
        caption="Bảng giá xe"
      />,
    );

    const priceSortButton = screen.getByRole("button", { name: /Giá thuê\/ngày/i });
    const headerCell = priceSortButton.closest("th");

    // Initial state: unsorted
    expect(headerCell).toHaveAttribute("aria-sort", "none");

    // Click 1: TanStack Table sorts numeric descending first
    fireEvent.click(priceSortButton);
    expect(headerCell).toHaveAttribute("aria-sort", "descending");
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Toyota Vios"); // 800000
    expect(rows[2]).toHaveTextContent("Honda City");  // 750000
    expect(rows[3]).toHaveTextContent("Hyundai Accent"); // 700000

    // Click 2: ascending
    fireEvent.click(priceSortButton);
    expect(headerCell).toHaveAttribute("aria-sort", "ascending");
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Hyundai Accent"); // 700000
    expect(rows[2]).toHaveTextContent("Honda City");      // 750000
    expect(rows[3]).toHaveTextContent("Toyota Vios");     // 800000

    // Click 3: unsorted
    fireEvent.click(priceSortButton);
    expect(headerCell).toHaveAttribute("aria-sort", "none");
  });

  it("respects enableSorting: false on columns and does not render sort button or aria-sort", () => {
    const nonSortableColumns: ColumnDef<VehicleRow>[] = [
      {
        accessorKey: "model",
        header: "Mẫu xe cố định",
        enableSorting: false,
        cell: (info) => info.getValue(),
      },
    ];

    render(
      <DataTable
        columns={nonSortableColumns}
        data={vehicleData}
        caption="Bảng không sort"
      />,
    );

    const th = screen.getByRole("columnheader", { name: "Mẫu xe cố định" });
    expect(th).not.toHaveAttribute("aria-sort");
    expect(screen.queryByRole("button", { name: /Mẫu xe cố định/i })).not.toBeInTheDocument();
  });

  it("supports controlled sorting via sorting prop and onSortingChange", () => {
    let currentSorting: SortingState = [{ id: "model", desc: false }];
    const onSortingChange = vi.fn((updater) => {
      currentSorting = typeof updater === "function" ? updater(currentSorting) : updater;
    });

    const { rerender } = render(
      <DataTable
        columns={columns}
        data={vehicleData}
        caption="Bảng controlled"
        sorting={currentSorting}
        onSortingChange={onSortingChange}
      />,
    );

    const modelSortButton = screen.getByRole("button", { name: /Mẫu xe/i });
    const headerCell = modelSortButton.closest("th");

    expect(headerCell).toHaveAttribute("aria-sort", "ascending");
    let rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Honda City");

    fireEvent.click(modelSortButton);
    expect(onSortingChange).toHaveBeenCalledTimes(1);

    // Simulate parent state update
    rerender(
      <DataTable
        columns={columns}
        data={vehicleData}
        caption="Bảng controlled"
        sorting={currentSorting}
        onSortingChange={onSortingChange}
      />,
    );

    expect(headerCell).toHaveAttribute("aria-sort", "descending");
    rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Toyota Vios");
  });
});
