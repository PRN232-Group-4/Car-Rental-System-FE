import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RentalsVolumeChart } from "@/features/admin/dashboard/components/RentalsVolumeChart";
import type { RevenuePoint } from "@/features/admin/dashboard/types";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const POINTS: RevenuePoint[] = [
  { bucket: "01/10", dateIso: "2026-10-01", total: 1_000_000, rentals: 3, previousRentals: 2 },
  { bucket: "02/10", dateIso: "2026-10-02", total: 2_000_000, rentals: 7, previousRentals: 5 },
  { bucket: "03/10", dateIso: "2026-10-03", total: 0, rentals: 0, previousRentals: 4 },
];

describe("RentalsVolumeChart — số lượt thuê theo thời gian", () => {
  it("tổng hợp đúng số lượt kỳ này và kỳ trước từ dữ liệu thật", () => {
    render(<RentalsVolumeChart data={POINTS} isLoading={false} isError={false} onRetry={vi.fn()} />);

    expect(screen.getByText(/Kỳ này: 10 lượt/)).toBeInTheDocument();
    expect(screen.getByText(/Kỳ trước: 11 lượt/)).toBeInTheDocument();
    // Ngày cao nhất được nêu rõ để người đọc không phải tự dò trên biểu đồ.
    expect(screen.getByText(/Cao nhất 7 lượt ngày 02\/10/)).toBeInTheDocument();
  });

  it("có bảng số liệu thay thế cho biểu đồ (a11y) và đúng số liệu từng ngày", () => {
    render(<RentalsVolumeChart data={POINTS} isLoading={false} isError={false} onRetry={vi.fn()} />);

    const toggle = screen.getByRole("button", { name: /Chuyển sang xem dạng bảng/i });
    fireEvent.click(toggle);

    expect(screen.getByText("Bảng số liệu cho Số lượt thuê theo thời gian")).toBeInTheDocument();
    // 7 (02/10) và 3 (01/10) phải xuất hiện trong bảng.
    expect(screen.getAllByText("7").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });

  it("hiển thị trạng thái trống khi không có ngày nào phát sinh", () => {
    render(<RentalsVolumeChart data={[]} isLoading={false} isError={false} onRetry={vi.fn()} />);

    expect(screen.getByText("Chưa có dữ liệu lượt thuê")).toBeInTheDocument();
    expect(screen.getByText(/Không có chuyến nào bắt đầu/)).toBeInTheDocument();
  });

  it("báo lỗi kèm nút thử lại thay vì biểu đồ rỗng", () => {
    const onRetry = vi.fn();
    render(<RentalsVolumeChart data={POINTS} isLoading={false} isError onRetry={onRetry} />);

    expect(screen.getByText(/Không thể tải biểu đồ số lượt thuê/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Thử lại/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it("không vẽ biểu đồ toàn số 0 khi backend cũ chưa trả số lượt", () => {
    render(
      <RentalsVolumeChart
        data={[{ bucket: "01/10", dateIso: "2026-10-01", total: 1_000_000 }]}
        isLoading={false}
        isError={false}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("Chưa có số liệu lượt thuê")).toBeInTheDocument();
  });

  it("dùng skeleton trạng thái trong lúc tải", () => {
    render(<RentalsVolumeChart data={undefined} isLoading isError={false} onRetry={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải biểu đồ số lượt thuê");
  });
});
