import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  pathname: "/admin",
  roles: ["Admin"] as string[],
}));

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock("@/components/navigation/NavigationProvider", () => ({
  useNavigationRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock("@/features/auth", () => ({
  useAuth: () => ({
    user: { fullName: "Nhân sự vận hành", roles: state.roles },
    logout: vi.fn(),
  }),
}));

vi.mock("@/features/auth/use-portal-access", () => ({
  usePortalAccess: () => ({
    account: { fullName: "Nhân sự vận hành", roles: state.roles },
    checkingAccess: false,
    accessError: null,
  }),
}));

vi.mock("@/features/admin/api", () => ({
  getFacilities: vi.fn().mockResolvedValue([]),
  getStaffById: vi.fn().mockResolvedValue(null),
}));

vi.mock("@/features/admin/use-navigation-counts", () => ({
  useNavigationCounts: () => ({ data: undefined, isError: false }),
}));

vi.mock("@/features/admin/transit-desk/RentalLiquidTransition", () => ({
  default: () => null,
}));

import { TransitDeskShell } from "@/features/admin/transit-desk/TransitDeskShell";

const renderShell = () =>
  render(
    <TransitDeskShell>
      <div>Nội dung vận hành</div>
    </TransitDeskShell>,
  );

const openPalette = () => {
  fireEvent.click(screen.getByRole("button", { name: "Tìm chức năng (Ctrl+K)" }));
  return screen.getByRole("dialog");
};

/** Mục bị chặn nằm cùng nhóm với một mục hợp lệ, nên masthead có nhóm nhưng không được có liên kết. */
const mastheadCases = [
  { roles: ["Staff"], pathname: "/admin/rentals", blocked: "Quản lý bảo trì", allowed: "Vận hành đơn thuê" },
  { roles: ["Manager"], pathname: "/admin/staffs", blocked: "Người dùng", allowed: "Nhân Viên" },
  { roles: ["CustomerService"], pathname: "/admin/customers", blocked: "Đánh giá nhân sự", allowed: "Khách hàng & GPLX" },
  { roles: ["Maintenance"], pathname: "/admin/inspections", blocked: "Vận hành đơn thuê", allowed: "Quản lý bảo trì" },
];

const paletteCases = [
  ...mastheadCases,
  { roles: ["Staff"], pathname: "/admin/dispatch", blocked: "Chính sách thuê xe", allowed: "Báo cáo sự cố" },
  { roles: ["CustomerService"], pathname: "/admin/customers", blocked: "Bàn giao xe", allowed: "Khách hàng & GPLX" },
];

beforeEach(() => {
  window.localStorage.clear();
});

describe("TransitDeskShell — điều hướng phân quyền chuẩn theo từng role", () => {
  it.each(mastheadCases)(
    "dải route của $roles tại $pathname chỉ hiện mục được phép",
    ({ roles, pathname, blocked, allowed }) => {
      state.roles = roles;
      state.pathname = pathname;
      renderShell();

      const strip = screen.getByRole("navigation", { name: /Các route thuộc nhóm/ });
      expect(within(strip).getByRole("link", { name: allowed })).toBeInTheDocument();
      expect(within(strip).queryByRole("link", { name: blocked })).not.toBeInTheDocument();
    },
  );

  it.each(paletteCases)(
    "command palette của $roles không chứa mục bị chặn",
    ({ roles, pathname, blocked, allowed }) => {
      state.roles = roles;
      state.pathname = pathname;
      renderShell();

      const dialog = openPalette();
      expect(within(dialog).getByText(allowed)).toBeInTheDocument();
      expect(within(dialog).queryByText(blocked)).not.toBeInTheDocument();
    },
  );

  it("Admin chỉ thấy các chức năng Quản trị hệ thống, không bị ôm đồm vận hành hay sự cố", () => {
    state.roles = ["Admin"];
    state.pathname = "/admin";
    renderShell();

    const dialog = openPalette();
    // Thấy các mục quản trị hệ thống & tổ chức
    for (const label of ["Người dùng", "Vai Trò", "Phòng Ban", "Cơ Sở", "Nhân Viên", "Nhật ký kiểm toán"]) {
      expect(within(dialog).getByText(label)).toBeInTheDocument();
    }
    // Không bị ôm đồm các module vận hành / sự cố / bảo trì của Staff
    for (const label of ["Vận hành đơn thuê", "Bàn giao xe", "Báo cáo sự cố", "Quản lý bảo trì", "Chính sách thuê xe"]) {
      expect(within(dialog).queryByText(label)).not.toBeInTheDocument();
    }
  });

  it("Staff thấy các module Vận hành và Chăm sóc & Sự cố nhưng không thấy Quản trị hệ thống", () => {
    state.roles = ["Staff"];
    state.pathname = "/admin";
    renderShell();

    const dialog = openPalette();
    // Thấy module vận hành và chăm sóc sự cố
    for (const label of ["Vận hành đơn thuê", "Bàn giao xe", "Báo cáo sự cố", "Khách hàng & GPLX", "Điều phối tài xế"]) {
      expect(within(dialog).getByText(label)).toBeInTheDocument();
    }
    // Không thấy module quản trị hệ thống của Admin
    for (const label of ["Người dùng", "Vai Trò", "Phòng Ban", "Cơ Sở", "Chính sách thuê xe"]) {
      expect(within(dialog).queryByText(label)).not.toBeInTheDocument();
    }
  });
});
