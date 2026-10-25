import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeAll, expect, it, vi } from "vitest";
import CustomerLicenseManager from "./CustomerLicenseManager";
import * as api from "./customer-license-api";

vi.mock("@/features/auth", () => ({ useAuth: () => ({ isLoading: false, hasRole: (role: string) => role === "manager" }) }));
vi.mock("next/image", () => ({ default: () => <span>Ảnh GPLX</span> }));
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});

it("reviews the selected license independently and clears confirmation when switching", async () => {
  const customer = { id: 7, userId: 9, fullName: "Khách thử", email: "customer@test.local", phone: null, isActive: true, licenseStatus: "pending" };
  const first = { id: 11, number: "FIRST123", type: "A1", issueDate: "2024-01-01", expiryDate: "2099-01-01", imageUrl: null, status: "approved" };
  const second = { ...first, id: 12, number: "SECOND456", type: "B", status: "pending" };
  vi.spyOn(api, "getCustomerLicenses").mockResolvedValue({ items: [customer], totalCount: 1, page: 1, pageSize: 20 });
  vi.spyOn(api, "getCustomerLicenseDetail").mockResolvedValue({ ...customer, license: { ...first, licenses: [first, second] } });
  const review = vi.spyOn(api, "reviewCustomerLicense").mockResolvedValue({ ...second, status: "approved" });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><CustomerLicenseManager /></QueryClientProvider>);
  fireEvent.click(await screen.findByRole("button", { name: "Xem và duyệt GPLX của Khách thử" }));
  const selector = await screen.findByLabelText("Giấy phép cần xét duyệt");
  fireEvent.change(screen.getByLabelText("Trạng thái mới *"), { target: { value: "approved" } });
  fireEvent.click(screen.getByLabelText(/Tôi xác nhận/));
  fireEvent.change(selector, { target: { value: "1" } });
  expect(screen.getByLabelText(/Tôi xác nhận/)).not.toBeChecked();
  expect(screen.getByLabelText("Trạng thái mới *")).toHaveValue("");
  expect(screen.getByText("SECOND456", { exact: true })).toBeVisible();
  fireEvent.change(screen.getByLabelText("Trạng thái mới *"), { target: { value: "approved" } });
  fireEvent.click(screen.getByLabelText(/Tôi xác nhận/));
  fireEvent.click(screen.getByRole("button", { name: "Lưu trạng thái" }));
  await waitFor(() => expect(review).toHaveBeenCalledWith(7, "approved", 12));
});
