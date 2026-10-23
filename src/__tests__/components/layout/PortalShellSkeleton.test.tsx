import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CardGridSkeleton, CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import {
  AdminShellSkeleton,
  CustomerShellSkeleton,
  DriverShellSkeleton,
} from "@/components/layout/PortalShellSkeleton";

describe("Khung xương dùng chung", () => {
  afterEach(cleanup);

  it("CardGridSkeleton dựng đúng số card yêu cầu và có nhãn cho trình đọc màn hình", () => {
    const { container } = render(<CardGridSkeleton label="Đang tải danh sách xe" count={4} />);

    expect(screen.getByRole("status")).toHaveTextContent("Đang tải danh sách xe");
    expect(container.querySelectorAll("[data-skeleton-card]")).toHaveLength(4);
    // Mọi mảnh xương là trang trí: không phần tử nào lọt vào cây trợ năng.
    expect(container.querySelectorAll("[aria-hidden='true']").length).toBeGreaterThan(4);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  it("CardGridSkeleton luôn có ít nhất một card dù truyền 0", () => {
    const { container } = render(<CardGridSkeleton count={0} />);
    expect(container.querySelectorAll("[data-skeleton-card]")).toHaveLength(1);
  });

  it("CardSkeleton cho phép đổi khung ngoài và số dòng", () => {
    const { container } = render(<CardSkeleton lines={2} containerClassName="rounded-3xl" mediaClassName="h-72 w-full" />);
    const card = container.querySelector("[data-skeleton-card]")!;

    expect(card).toHaveClass("rounded-3xl");
    expect(card.querySelectorAll("span[data-skeleton]")).toHaveLength(3); // 1 ảnh + 2 dòng
  });

  it("TableSkeleton giữ đúng số dòng/cột", () => {
    const { container } = render(<TableSkeleton label="Đang tải danh sách" rows={3} columns={4} />);

    expect(screen.getByRole("status")).toHaveTextContent("Đang tải danh sách");
    // 1 hàng tiêu đề + 3 hàng dữ liệu
    expect(container.querySelectorAll("div.flex.items-center.gap-4")).toHaveLength(4);
  });
});

describe("Khung xương theo cổng", () => {
  afterEach(cleanup);

  it("Admin có masthead + bảng dữ liệu và đánh dấu đúng portal", () => {
    const { container } = render(<AdminShellSkeleton />);
    const root = container.querySelector("[data-portal='admin']")!;

    expect(root).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải không gian vận hành");
    // Bảng danh sách 6 dòng dữ liệu + hàng tiêu đề
    expect(container.querySelectorAll("div.flex.items-center.gap-4").length).toBeGreaterThanOrEqual(6);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  it("Customer có folio + lưới card, không dùng chung khung với Admin", () => {
    const { container } = render(<CustomerShellSkeleton />);

    expect(container.querySelector("[data-portal='customer']")).toBeInTheDocument();
    expect(container.querySelector("[data-portal='admin']")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải khu khách hàng");
  });

  it("cổng tài xế có khung riêng", () => {
    const { container } = render(<DriverShellSkeleton />);

    expect(container.querySelector("[data-portal='driver']")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Đang tải cổng tài xế");
  });

  it("mỗi cổng chỉ có đúng một vùng trạng thái để không đọc trùng", () => {
    const { container } = render(<AdminShellSkeleton />);
    expect(container.querySelectorAll("[role='status']")).toHaveLength(1);
    cleanup();
    const { container: customerContainer } = render(<CustomerShellSkeleton />);
    expect(customerContainer.querySelectorAll("[role='status']")).toHaveLength(1);
  });
});
