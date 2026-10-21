import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { VehicleDto } from "./api";
import VehiclePhotos, { RentalVehiclePhotos, VehiclePhotoGrid } from "./VehiclePhotos";

const api = vi.hoisted(() => ({ getVehicle: vi.fn(), getOperationalRental: vi.fn() }));
vi.mock("./api", () => ({ getVehicle: api.getVehicle }));
vi.mock("@/features/operations/api", () => ({ getOperationalRental: api.getOperationalRental }));

const vehicle = {
  id: 8, brand: "Toyota", model: "Corolla Cross", licensePlate: "51F-010.01",
  mainImageUrl: "/media/front.jpg",
  detail: { galleryImages: ["/media/side.jpg", "/media/rear.jpg"] },
} as VehicleDto;

beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

function withCache(children: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  return render(<QueryClientProvider client={client}>{children}</QueryClientProvider>);
}

it("shows the main and all gallery photos with links to the originals", () => {
  render(<VehiclePhotoGrid vehicle={vehicle} />);
  expect(screen.getAllByRole("img")).toHaveLength(3);
  expect(screen.getAllByRole("link").map((link) => link.getAttribute("href")))
    .toEqual(["/media/front.jpg", "/media/side.jpg", "/media/rear.jpg"]);
  expect(screen.getByRole("link", { name: /Mở ảnh 1.*Toyota.*51F-010.01/ })).toHaveAttribute("target", "_blank");
});

it("omits duplicates, empty values and unsafe image URLs", () => {
  render(<VehiclePhotoGrid vehicle={{ ...vehicle, detail: { galleryImages: [" /media/front.jpg ", "", "javascript:alert(1)", "//example.test/image.jpg", "/media/side.jpg"] } }} />);
  expect(screen.getAllByRole("link")).toHaveLength(2);
});

it("still displays gallery photos when the main photo is missing", () => {
  render(<VehiclePhotoGrid vehicle={{ ...vehicle, mainImageUrl: null }} />);
  expect(screen.getAllByRole("img")).toHaveLength(2);
  expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/media/side.jpg");
});

it("shows an explicit empty state without substituting another vehicle's photos", () => {
  render(<VehiclePhotoGrid vehicle={{ ...vehicle, mainImageUrl: null, detail: null }} />);
  expect(screen.getByText("Phương tiện chưa có hình ảnh.")).toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});

it("keeps a broken photo from hiding the rest of the gallery", () => {
  render(<VehiclePhotoGrid vehicle={vehicle} />);
  fireEvent.error(screen.getAllByRole("img")[0]);
  expect(screen.getByRole("img", { name: /Không tải được ảnh/ })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Mở ảnh 3/ })).toHaveAttribute("href", "/media/rear.jpg");
});

it("loads full vehicle detail once for multiple references to the same vehicle", async () => {
  api.getVehicle.mockResolvedValue(vehicle);
  withCache(<><VehiclePhotos vehicleId={8} /><VehiclePhotos vehicleId="8" /></>);
  await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(6));
  expect(api.getVehicle).toHaveBeenCalledExactlyOnceWith(8);
});

it("replaces the old vehicle photos when the selected vehicle changes", async () => {
  api.getVehicle.mockResolvedValueOnce(vehicle).mockResolvedValueOnce({ ...vehicle, id: 9, mainImageUrl: "/media/other.jpg", detail: null });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const view = render(<QueryClientProvider client={client}><VehiclePhotos vehicleId={8} /></QueryClientProvider>);
  await screen.findByRole("link", { name: /Mở ảnh 3/ });
  view.rerender(<QueryClientProvider client={client}><VehiclePhotos vehicleId={9} /></QueryClientProvider>);
  expect(screen.queryByRole("link", { name: /Mở ảnh 3/ })).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole("link", { name: /Mở ảnh 1/ })).toHaveAttribute("href", "/media/other.jpg"));
});

it("resolves the vehicle via the rental ID instead of treating the rental ID as a vehicle ID", async () => {
  api.getOperationalRental.mockResolvedValue({ id: 201, vehicleId: 8 });
  api.getVehicle.mockResolvedValue(vehicle);
  withCache(<RentalVehiclePhotos rentalId={201} />);
  await screen.findByRole("link", { name: /Mở ảnh 3/ });
  expect(api.getOperationalRental).toHaveBeenCalledExactlyOnceWith(201);
  expect(api.getVehicle).toHaveBeenCalledExactlyOnceWith(8);
});

it("offers a retry after a vehicle request fails", async () => {
  api.getVehicle.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(vehicle);
  withCache(<VehiclePhotos vehicleId={8} />);
  fireEvent.click(await screen.findByRole("button", { name: "Tải lại ảnh phương tiện" }));
  await screen.findByRole("link", { name: /Mở ảnh 3/ });
});

it("skips requests for invalid vehicle IDs", () => {
  withCache(<VehiclePhotos vehicleId="invalid" />);
  expect(screen.getByText("Chưa có phương tiện liên kết.")).toBeInTheDocument();
  expect(api.getVehicle).not.toHaveBeenCalled();
});
