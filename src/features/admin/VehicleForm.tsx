"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Info, Save, X } from "lucide-react";
import { MOCK_FACILITIES } from "@/api/mock/mock-catalog";
import {
  INITIAL_MANAGED_VEHICLES,
  loadManagedVehicles,
  saveManagedVehicles,
  VEHICLE_CATEGORIES,
} from "./vehicle-store";
import type { ManagedVehicle, VehicleStatus } from "./vehicle-store";

interface VehicleDraft {
  category: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: string;
  seats: string;
  transmission: string;
  fuelType: string;
  batteryCapacity: string;
  maxRange: string;
  facilityId: string;
  status: VehicleStatus;
  hourlyPrice: string;
  monthlyPrice: string;
  imageUrl: string;
}

const emptyDraft: VehicleDraft = {
  category: "",
  licensePlate: "",
  brand: "",
  model: "",
  year: "",
  seats: "",
  transmission: "",
  fuelType: "",
  batteryCapacity: "",
  maxRange: "",
  facilityId: "",
  status: "available",
  hourlyPrice: "",
  monthlyPrice: "",
  imageUrl: "",
};

const statusOptions: { value: VehicleStatus; label: string }[] = [
  { value: "available", label: "Sẵn sàng" },
  { value: "rented", label: "Đang thuê" },
  { value: "maintenance", label: "Đang bảo dưỡng" },
  { value: "unavailable", label: "Tạm ngưng hoạt động" },
];

const transmissionOptions = [
  { value: "automatic", label: "Tự động" },
  { value: "manual", label: "Số sàn" },
  { value: "single-speed", label: "Một cấp" },
  { value: "not-applicable", label: "Không áp dụng" },
];

export default function VehicleForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<VehicleDraft>(emptyDraft);
  const [vehicles, setVehicles] = useState<ManagedVehicle[]>(INITIAL_MANAGED_VEHICLES);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState("");
  const [vehicleId, setVehicleId] = useState<string | undefined>();
  const isEditing = Boolean(vehicleId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const id = new URLSearchParams(window.location.search).get("vehicleId") ?? undefined;
      setVehicleId(id);
      try {
        const stored = loadManagedVehicles();
        setVehicles(stored);
        if (id) {
          const vehicle = stored.find((item) => item.id === id);
          if (!vehicle) {
            setError("Không tìm thấy phương tiện cần chỉnh sửa.");
          } else {
            const [brand = "", ...modelParts] = vehicle.name.split(" ");
            setDraft({
              category: vehicle.category,
              licensePlate: vehicle.licensePlate,
              brand,
              model: modelParts.join(" "),
              year: String(vehicle.year),
              seats: vehicle.seats ? String(vehicle.seats) : "",
              transmission: vehicle.transmission.startsWith("Tự động")
                ? "automatic"
                : vehicle.transmission.startsWith("Số sàn")
                  ? "manual"
                  : vehicle.transmission === "Một cấp"
                    ? "single-speed"
                    : "not-applicable",
              fuelType: vehicle.fuelType?.startsWith("Xăng") ? "gasoline" : vehicle.fuelType?.startsWith("Dầu") ? "diesel" : vehicle.fuelType ? "electric" : "",
              batteryCapacity: vehicle.batteryCapacity ?? "",
              maxRange: vehicle.maxRange ?? "",
              facilityId: vehicle.facilityId,
              status: vehicle.status,
              hourlyPrice: String(vehicle.hourlyPrice),
              monthlyPrice: String(vehicle.monthlyPrice),
              imageUrl: vehicle.imageUrl,
            });
          }
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu phương tiện.");
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const updateDraft = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.currentTarget;
    setDraft((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    setImageError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setImageError("Ảnh cần nhỏ hơn 1.5 MB để lưu an toàn trong trình duyệt.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraft((current) => ({ ...current, imageUrl: reader.result as string }));
      } else {
        setImageError("Không thể đọc ảnh này. Vui lòng chọn ảnh khác.");
      }
    };
    reader.onerror = () => setImageError("Không thể đọc ảnh này. Vui lòng thử lại.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const normalizedPlate = draft.licensePlate.trim().toLocaleUpperCase();
    if (vehicles.some((item) => item.licensePlate.toLocaleUpperCase() === normalizedPlate && item.id !== vehicleId)) {
      setError("Biển số xe này đã được sử dụng.");
      return;
    }
    const category = VEHICLE_CATEGORIES.find((item) => item.value === draft.category);
    const facility = MOCK_FACILITIES.find((item) => item.id === draft.facilityId);
    if (!category || !facility) {
      setError("Vui lòng chọn loại phương tiện và chi nhánh hợp lệ.");
      return;
    }

    const existing = vehicles.find((item) => item.id === vehicleId);
    const nextVehicle: ManagedVehicle = {
      id: existing?.id ?? `v-${Date.now()}`,
      name: `${draft.brand.trim()} ${draft.model.trim()}`.trim(),
      category: category.value,
      categoryLabel: category.label,
      year: Number(draft.year),
      seats: draft.seats ? Number(draft.seats) : undefined,
      transmission: transmissionOptions.find((item) => item.value === draft.transmission)?.label ?? "Không áp dụng",
      fuelType: draft.fuelType === "gasoline" ? "Xăng" : draft.fuelType === "diesel" ? "Dầu diesel" : draft.fuelType === "electric" ? "Điện" : undefined,
      batteryCapacity: draft.batteryCapacity.trim() || undefined,
      maxRange: draft.maxRange.trim() || undefined,
      hourlyPrice: Number(draft.hourlyPrice),
      monthlyPrice: Number(draft.monthlyPrice),
      facilityId: facility.id,
      facilityName: facility.shortName,
      imageUrl: draft.imageUrl.trim(),
      badges: existing?.badges ?? [],
      isAvailable: draft.status === "available",
      supportsSubscription: existing?.supportsSubscription ?? false,
      licensePlate: normalizedPlate,
      status: draft.status,
    };
    const updated = existing
      ? vehicles.map((item) => item.id === existing.id ? nextVehicle : item)
      : [nextVehicle, ...vehicles];

    try {
      saveManagedVehicles(updated);
      router.push("/admin/vehicles");
    } catch {
      setError("Không thể lưu phương tiện vào bộ nhớ trình duyệt. Hãy xóa một số ảnh cũ hoặc chọn ảnh nhỏ hơn.");
    }
  };

  const isElectric = draft.category === "electric_car" || draft.category === "electric_motorbike";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/admin/vehicles" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-800">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách phương tiện
        </Link>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Quản lý đội xe</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{isEditing ? "Chỉnh sửa phương tiện" : "Thêm phương tiện mới"}</h2>
        <p className="mt-2 text-sm text-slate-500">Quản lý thông tin, hình ảnh, giá thuê và tình trạng phương tiện.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Dữ liệu được lưu trên trình duyệt hiện tại; ảnh tải lên chỉ khả dụng trên thiết bị này cho đến khi kết nối API lưu trữ.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-7">
          <h3 className="border-b border-slate-100 pb-4 text-base font-bold text-slate-900">Thông tin phương tiện</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Loại phương tiện" htmlFor="category">
              <select id="category" name="category" required value={draft.category} onChange={updateDraft} className="admin-input">
                <option value="" disabled>Chọn loại phương tiện</option>
                {VEHICLE_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Biển số xe" htmlFor="licensePlate">
              <input id="licensePlate" name="licensePlate" required value={draft.licensePlate} onChange={updateDraft} placeholder="Ví dụ: 51K-123.45" className="admin-input" />
            </Field>
            <Field label="Hãng xe" htmlFor="brand">
              <input id="brand" name="brand" required value={draft.brand} onChange={updateDraft} placeholder="Ví dụ: Toyota" className="admin-input" />
            </Field>
            <Field label="Dòng xe / Phiên bản" htmlFor="model">
              <input id="model" name="model" required value={draft.model} onChange={updateDraft} placeholder="Ví dụ: Vios G" className="admin-input" />
            </Field>
            <Field label="Năm sản xuất" htmlFor="year">
              <input id="year" name="year" type="number" min="1990" max="2035" required value={draft.year} onChange={updateDraft} placeholder="2025" className="admin-input" />
            </Field>
            <Field label="Số chỗ ngồi" htmlFor="seats">
              <input id="seats" name="seats" type="number" min="1" max="50" value={draft.seats} onChange={updateDraft} placeholder="5" className="admin-input" />
            </Field>
            <Field label="Hộp số" htmlFor="transmission">
              <select id="transmission" name="transmission" value={draft.transmission} onChange={updateDraft} className="admin-input">
                <option value="">Chọn hộp số</option>
                {transmissionOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Nhiên liệu" htmlFor="fuelType">
              <select id="fuelType" name="fuelType" value={draft.fuelType} onChange={updateDraft} className="admin-input">
                <option value="">Chọn nhiên liệu</option>
                <option value="gasoline">Xăng</option>
                <option value="diesel">Dầu diesel</option>
                <option value="electric">Điện</option>
              </select>
            </Field>
            {isElectric && (
              <>
                <Field label="Dung lượng pin" htmlFor="batteryCapacity">
                  <input id="batteryCapacity" name="batteryCapacity" value={draft.batteryCapacity} onChange={updateDraft} placeholder="Ví dụ: 87.7 kWh" className="admin-input" />
                </Field>
                <Field label="Quãng đường tối đa" htmlFor="maxRange">
                  <input id="maxRange" name="maxRange" value={draft.maxRange} onChange={updateDraft} placeholder="Ví dụ: 471 km / lần sạc" className="admin-input" />
                </Field>
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-7">
          <h3 className="border-b border-slate-100 pb-4 text-base font-bold text-slate-900">Kinh doanh & vận hành</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Chi nhánh quản lý" htmlFor="facilityId">
              <select id="facilityId" name="facilityId" required value={draft.facilityId} onChange={updateDraft} className="admin-input">
                <option value="" disabled>Chọn chi nhánh</option>
                {MOCK_FACILITIES.map((item) => <option key={item.id} value={item.id}>{item.shortName} — {item.city}</option>)}
              </select>
            </Field>
            <Field label="Trạng thái" htmlFor="status">
              <select id="status" name="status" required value={draft.status} onChange={updateDraft} className="admin-input">
                {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Giá thuê theo giờ (₫)" htmlFor="hourlyPrice">
              <input id="hourlyPrice" name="hourlyPrice" type="number" min="0" step="1000" required value={draft.hourlyPrice} onChange={updateDraft} placeholder="150000" className="admin-input" />
            </Field>
            <Field label="Giá thuê theo tháng (₫)" htmlFor="monthlyPrice">
              <input id="monthlyPrice" name="monthlyPrice" type="number" min="0" step="100000" required value={draft.monthlyPrice} onChange={updateDraft} placeholder="18000000" className="admin-input" />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-7">
          <h3 className="border-b border-slate-100 pb-4 text-base font-bold text-slate-900">Hình ảnh phương tiện</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <Field label="Tải ảnh lên (JPG, PNG, WEBP · tối đa 1.5 MB)" htmlFor="vehicleImage">
                <input ref={fileRef} id="vehicleImage" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="block w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-emerald-50 file:px-4 file:py-3 file:font-semibold file:text-emerald-800 hover:file:bg-emerald-100" />
              </Field>
              {imageError && <p role="alert" className="text-sm text-red-700">{imageError}</p>}
              <Field label="Hoặc nhập URL ảnh" htmlFor="imageUrl">
                <input id="imageUrl" name="imageUrl" type="url" value={draft.imageUrl.startsWith("data:") ? "" : draft.imageUrl} onChange={updateDraft} placeholder="https://example.com/vehicle.jpg" className="admin-input" />
              </Field>
              <p className="text-xs leading-5 text-slate-500">Ảnh tải lên được lưu trong trình duyệt này. Ảnh URL phải có thể truy cập công khai.</p>
            </div>
            <div className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 bg-cover bg-center" style={draft.imageUrl ? { backgroundImage: `url("${draft.imageUrl}")` } : undefined}>
              {draft.imageUrl ? (
                <button type="button" onClick={() => setDraft((current) => ({ ...current, imageUrl: "" }))} aria-label="Xóa ảnh phương tiện" className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-slate-600 shadow hover:text-red-700">
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <div className="text-center text-slate-400">
                  <ImagePlus className="mx-auto h-7 w-7" />
                  <span className="mt-2 block text-xs">Ảnh xem trước</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link href="/admin/vehicles" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Hủy</Link>
          <button type="submit" disabled={!ready} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">
            <Save className="h-4 w-4" /> {isEditing ? "Lưu thay đổi" : "Thêm phương tiện"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}
