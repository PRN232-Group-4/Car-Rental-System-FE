import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GPLXPage from "@/app/(dashboard)/driver-license/page";
import ProfileManager from "@/features/profile/components/ProfileManager";
import { ApiClientError } from "@/api/api-client";

const mocks = vi.hoisted(() => ({ getLicense: vi.fn(), save: vi.fn(), getProfile: vi.fn(), replace: vi.fn() }));
vi.mock("@/features/licenses", () => ({ getCustomerLicense: mocks.getLicense, saveCustomerLicense: mocks.save }));
vi.mock("@/features/licenses/api", () => ({ saveCustomerLicense: mocks.save }));
vi.mock("@/features/profile/api", () => ({ getAccountProfile: mocks.getProfile, getCustomerLicense: mocks.getLicense, updateAccountProfile: vi.fn() }));
vi.mock("@/features/auth", () => ({ useAuth: () => ({ isLoading: false, isAuthenticated: true }) }));
vi.mock("@/components/navigation/NavigationProvider", () => {
  const router = { replace: mocks.replace };
  return { useNavigationRouter: () => router };
});
vi.mock("@/features/profile/components/ChangePasswordForm", () => ({ default: () => null }));
vi.mock("@/features/licenses/components/BookingLicenseReturn", () => ({ default: () => null }));
vi.mock("next/image", () => ({ default: () => <span>Ảnh GPLX</span> }));

const saved = { number: "ABC123", type: "B1", issueDate: "2024-01-01", expiryDate: "2099-01-01", imageUrl: "https://example.test/license.png", status: "pending" };
const photo = () => new File(["image"], "license.png", { type: "image/png" });

describe.each(["driver-license", "profile"] as const)("Form GPLX tại %s", (page) => {
  let container: HTMLElement;
  const numberInput = () => container.querySelector<HTMLInputElement>('[name="licenseNumber"]')!;
  const field = (name: string) => container.querySelector<HTMLInputElement>(`[name="${name}"]`)!;
  const fileInput = () => container.querySelector<HTMLInputElement>('input[type="file"]')!;
  const uploadName = () => page === "profile" ? "imageUrl" : "file";
  const submitButton = () => screen.getByRole("button", { name: page === "profile" ? "Gửi giấy phép để xét duyệt" : "Cập nhật hồ sơ GPLX" });
  const submit = () => fireEvent.click(submitButton());
  const fillDetails = () => {
    fireEvent.change(numberInput(), { target: { value: " ABC123 " } });
    fireEvent.change(field("licenseType"), { target: { value: "B1" } });
    fireEvent.change(field("issueDate"), { target: { value: "2024-01-01" } });
    fireEvent.change(field("expiryDate"), { target: { value: "2099-01-01" } });
  };
  async function open() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    ({ container } = render(<QueryClientProvider client={client}>{page === "profile" ? <ProfileManager /> : <GPLXPage />}</QueryClientProvider>));
    await waitFor(() => expect(numberInput()).toBeTruthy());
    await waitFor(() => expect(submitButton()).toBeEnabled());
  }

  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getLicense.mockResolvedValue(null);
    mocks.getProfile.mockResolvedValue({ fullName: "Khách hàng", email: "user@test.local", phone: "", gender: "" });
    mocks.save.mockResolvedValue(saved);
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100, height: 30 }] as unknown as DOMRectList);
    vi.stubGlobal("URL", class extends URL {
      static createObjectURL = vi.fn(() => "blob:license");
      static revokeObjectURL = vi.fn();
    });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it("chặn gửi trống, hiện toàn bộ lỗi inline và focus trường đầu tiên", async () => {
    await open(); submit();
    for (const name of ["licenseNumber", "issueDate", "expiryDate", uploadName()]) {
      expect(field(name)).toHaveAttribute("aria-invalid", "true");
      const errorId = field(name).getAttribute("aria-describedby")!;
      expect(document.getElementById(errorId)).toBeVisible();
    }
    if (page === "profile") expect(field("licenseType")).toHaveAttribute("aria-invalid", "true");
    expect(numberInput()).toHaveFocus();
    expect(mocks.save).not.toHaveBeenCalled();
    fireEvent.change(numberInput(), { target: { value: "ABC123" } });
    expect(numberInput()).toHaveAttribute("aria-invalid", "false");
    expect(field("issueDate")).toHaveAttribute("aria-invalid", "true");
  });

  it.each([null, "", "   "])("khách chưa gửi số GPLX (%s) không bị hiển thị hoặc khóa chờ duyệt", async (number) => {
    mocks.getLicense.mockResolvedValue({ number, type: null, issueDate: null, expiryDate: null, imageUrl: null, status: "pending" });
    await open();
    expect(screen.queryByText("Đã gửi tài liệu")).not.toBeInTheDocument();
    expect(screen.queryByText("Chờ phê duyệt")).not.toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ đang chờ phê duyệt")).not.toBeInTheDocument();
    expect(screen.queryByText("Đang chờ duyệt")).not.toBeInTheDocument();
    fillDetails();
    fireEvent.change(fileInput(), { target: { files: [photo()] } });
    submit();
    await waitFor(() => expect(mocks.save).toHaveBeenCalledOnce());
    if (page === "profile") {
      expect(await screen.findByText("Đã gửi tài liệu")).toBeVisible();
      expect(screen.getByRole("button", { name: "Đang chờ phê duyệt" })).toBeDisabled();
    }
  });

  it("status none không đánh dấu đã gửi tài liệu", async () => {
    mocks.getLicense.mockResolvedValue({ number: null, type: null, issueDate: null, expiryDate: null, imageUrl: null, status: "none" });
    await open();
    expect(screen.queryByText("Đã gửi tài liệu")).not.toBeInTheDocument();
    expect(submitButton()).toBeEnabled();
  });

  if (page === "profile") it("hồ sơ đã gửi thực sự tiếp tục chờ duyệt và khóa gửi lặp", async () => {
    mocks.getLicense.mockResolvedValue(saved);
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
    ({ container } = render(<QueryClientProvider client={client}><ProfileManager /></QueryClientProvider>));
    expect(await screen.findByText("Đã gửi tài liệu")).toBeVisible();
    expect(screen.getByRole("button", { name: "Đang chờ phê duyệt" })).toBeDisabled();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("ngày cấp bắt buộc ngay cả khi đã có ảnh và các trường khác", async () => {
    await open(); fillDetails();
    fireEvent.change(field("issueDate"), { target: { value: "" } });
    fireEvent.change(fileInput(), { target: { files: [photo()] } });
    submit();
    expect(field("issueDate")).toHaveAttribute("aria-invalid", "true");
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("yêu cầu chọn ảnh khi gửi lại hồ sơ đã có ảnh cũ", async () => {
    mocks.getLicense.mockResolvedValue({ ...saved, status: "rejected" });
    await open(); submit();
    expect(field(uploadName())).toHaveAttribute("aria-invalid", "true");
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it("không nhận tệp sai định dạng", async () => {
    await open(); fillDetails();
    fireEvent.change(fileInput(), { target: { files: [new File(["text"], "license.txt", { type: "text/plain" })] } });
    expect(field(uploadName())).toHaveAttribute("aria-invalid", "true");
    submit(); expect(mocks.save).not.toHaveBeenCalled();
  });

  it("gửi đủ thông tin cùng file ảnh qua API GPLX", async () => {
    await open(); fillDetails();
    const file = photo();
    fireEvent.change(fileInput(), { target: { files: [file] } }); submit();
    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ number: "ABC123", type: "B1", issueDate: "2024-01-01", expiryDate: "2099-01-01", file }));
  });

  it("chặn ngày cấp sau ngày hết hạn và giấy phép hết hạn", async () => {
    await open(); fillDetails();
    fireEvent.change(field("issueDate"), { target: { value: "2099-01-02" } });
    fireEvent.change(field("expiryDate"), { target: { value: "2020-01-01" } });
    fireEvent.change(fileInput(), { target: { files: [photo()] } }); submit();
    expect(field("issueDate")).toHaveAttribute("aria-invalid", "true");
    expect(field("expiryDate")).toHaveAttribute("aria-invalid", "true");
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it.each([0, 5 * 1024 * 1024 + 1])("chặn ảnh có kích thước %s byte", async (size) => {
    await open(); fillDetails();
    const file = photo(); Object.defineProperty(file, "size", { value: size });
    fireEvent.change(fileInput(), { target: { files: [file] } });
    expect(field(uploadName())).toHaveAttribute("aria-invalid", "true");
    submit(); expect(mocks.save).not.toHaveBeenCalled();
  });

  it("ánh xạ lỗi API về ngày cấp và ảnh, giữ dữ liệu và xóa riêng lỗi đã sửa", async () => {
    mocks.save.mockRejectedValue(new ApiClientError(400, "Bad Request", { error: { errors: { IssueDate: ["Ngày cấp không hợp lệ."], File: ["Ảnh không hợp lệ."] } } }));
    await open(); fillDetails();
    fireEvent.change(fileInput(), { target: { files: [photo()] } }); submit();
    expect(await screen.findByText("Ngày cấp không hợp lệ.")).toBeVisible();
    expect(screen.getByText("Ảnh không hợp lệ.")).toBeVisible();
    expect(numberInput()).toHaveValue(" ABC123 ");
    fireEvent.change(field("issueDate"), { target: { value: "2024-02-01" } });
    expect(screen.queryByText("Ngày cấp không hợp lệ.")).not.toBeInTheDocument();
    expect(screen.getByText("Ảnh không hợp lệ.")).toBeVisible();
  });

  it("hiện lỗi mạng và giữ thông tin để thử lại", async () => {
    mocks.save.mockRejectedValue(new TypeError("Không thể kết nối máy chủ."));
    await open(); fillDetails();
    fireEvent.change(fileInput(), { target: { files: [photo()] } }); submit();
    expect(await screen.findByText(/Không thể kết nối máy chủ/)).toBeVisible();
    expect(numberInput()).toHaveValue(" ABC123 ");
    expect(field("issueDate")).toHaveValue("2024-01-01");
    expect(submitButton()).toBeEnabled();
  });
});
