import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import InspectionDirectory, { InspectionWorkQueue } from "./InspectionDirectory";
import { ApiClientError } from "@/api/api-client";

const api = vi.hoisted(() => ({ getInspectionDirectory: vi.fn(), getOperationalRentals: vi.fn() }));
vi.mock("./inspection-directory-api", async (importOriginal) => ({ ...await importOriginal<typeof import("./inspection-directory-api")>(), getInspectionDirectory: api.getInspectionDirectory }));
vi.mock("./rental-list-api", () => ({ getOperationalRentals: api.getOperationalRentals }));

const pre = { id: 1, rentalId: 101, vehicleId: 3, vehicleName: "Toyota Vios", licensePlate: "51F-010.02", inspectionType: "pre_rental", isOk: true, inspectorEmail: "tech@example.test", inspectedAt: "2026-10-21T03:00:00Z", odometerKm: 12345, fuelBatteryLevel: 80, damageNotes: "Cản trước có vết xước", imageUrls: '["https://example.test/inspection.jpg"]' };
const post = { ...pre, id: 2, rentalId: 102, inspectionType: "post_rental", isOk: false, inspectorEmail: "post@example.test" };

beforeEach(() => {
  vi.resetAllMocks();
  api.getInspectionDirectory.mockResolvedValue({ items: [pre, post], page: 1, pageSize: 20, totalCount: 2 });
  api.getOperationalRentals.mockResolvedValue({ items: [{ id: 101, vehicleModel: "Toyota Vios", licensePlate: pre.licensePlate, customerEmail: "customer@example.test", status: "pre_inspection" }], page: 1, pageSize: 10, totalCount: 1 });
});

function setup(node = <InspectionDirectory />) {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{node}</QueryClientProvider>);
}

it("lists pre/post records immediately, without requiring a rental ID, and opens full evidence", async () => {
  setup();
  await screen.findByText("2 biên bản kiểm tra");
  expect(api.getInspectionDirectory).toHaveBeenCalledWith({ page: 1, pageSize: 20, inspectionType: undefined, rentalId: undefined }, expect.any(AbortSignal));
  expect(screen.getByText("tech@example.test")).toBeVisible();
  expect(screen.getByText("post@example.test")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Xem biên bản trước thuê đơn #101" }));
  const detail = screen.getByRole("region", { name: "Chi tiết biên bản kiểm tra" });
  expect(within(detail).getByText("12345")).toBeVisible();
  expect(within(detail).getByText("80")).toBeVisible();
  expect(within(detail).getByText("Cản trước có vết xước")).toBeVisible();
  expect(within(detail).getByRole("img")).toHaveAttribute("src", "https://example.test/inspection.jpg");
  expect(within(detail).getByRole("link", { name: "Mở hồ sơ đơn #101" })).toHaveAttribute("href", "/admin/inspections?rentalId=101#inspection-editor");
});

it("loads subsequent pages and applies/resets filters with page reset", async () => {
  api.getInspectionDirectory.mockImplementation(async (params) => ({ items: params.page === 2 ? [post] : [pre], ...params, totalCount: 21 }));
  setup();
  await screen.findByText("21 biên bản kiểm tra");
  fireEvent.click(screen.getByRole("button", { name: "Trang tiếp theo" }));
  await screen.findByText("post@example.test");
  fireEvent.change(screen.getByLabelText("Loại biên bản"), { target: { value: "post_rental" } });
  fireEvent.change(screen.getByLabelText("Đơn thuê"), { target: { value: "102" } });
  fireEvent.click(screen.getByRole("button", { name: "Lọc biên bản" }));
  await waitFor(() => expect(api.getInspectionDirectory).toHaveBeenLastCalledWith({ page: 1, pageSize: 20, inspectionType: "post_rental", rentalId: 102 }, expect.any(AbortSignal)));
  fireEvent.click(screen.getByRole("button", { name: "Đặt lại bộ lọc" }));
  await waitFor(() => expect(api.getInspectionDirectory).toHaveBeenLastCalledWith({ page: 1, pageSize: 20, inspectionType: undefined, rentalId: undefined }, expect.any(AbortSignal)));
});

it("rejects invalid rental ID inline before sending filters", async () => {
  setup();
  await screen.findByText("2 biên bản kiểm tra");
  fireEvent.change(screen.getByLabelText("Đơn thuê"), { target: { value: "0" } });
  fireEvent.click(screen.getByRole("button", { name: "Lọc biên bản" }));
  expect(await screen.findByText("Giá trị phải từ 1 trở lên.")).toBeVisible();
  expect(api.getInspectionDirectory).toHaveBeenCalledTimes(1);
});

it("shows retryable API errors rather than claiming there are no inspections", async () => {
  api.getInspectionDirectory.mockRejectedValueOnce(new TypeError("network"));
  setup();
  await screen.findByRole("alert");
  expect(screen.queryByText("Chưa có biên bản kiểm tra phù hợp.")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Tải lại biên bản" }));
  await screen.findByText("2 biên bản kiểm tra");
});

it("maps backend filter validation beneath its input and clears it when edited", async () => {
  setup();
  await screen.findByText("2 biên bản kiểm tra");
  api.getInspectionDirectory.mockRejectedValueOnce(new ApiClientError(400, "Bad Request", { error: { errors: { RentalId: ["Đơn thuê không hợp lệ. Vui lòng kiểm tra mã đơn."] } } }));
  const input = screen.getByLabelText("Đơn thuê");
  fireEvent.change(input, { target: { value: "101" } });
  fireEvent.click(screen.getByRole("button", { name: "Lọc biên bản" }));
  await screen.findByText("Đơn thuê không hợp lệ. Vui lòng kiểm tra mã đơn.");
  expect(input).toHaveAttribute("aria-invalid", "true");
  fireEvent.change(input, { target: { value: "102" } });
  expect(input).toHaveAttribute("aria-invalid", "false");
});

it("offers real waiting rentals, both stages, and links to the selected rental", async () => {
  setup(<InspectionWorkQueue />);
  await screen.findByText("customer@example.test");
  expect(screen.getByRole("link", { name: "Mở kiểm tra đơn #101" })).toHaveAttribute("href", "/admin/inspections?rentalId=101#inspection-editor");
  fireEvent.change(screen.getByLabelText("Giai đoạn kiểm tra"), { target: { value: "post_inspection" } });
  await waitFor(() => expect(api.getOperationalRentals).toHaveBeenLastCalledWith({ status: "post_inspection", page: 1, pageSize: 10 }, expect.any(AbortSignal)));
});
