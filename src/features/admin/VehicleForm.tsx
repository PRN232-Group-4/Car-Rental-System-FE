"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Info, Save, X } from "lucide-react";
import {
  createVehicle,
  getFacilities,
  getVehicle,
  getVehicleTypes,
  updateVehicle,
  uploadVehicleImage,
} from "./api";
import type { OrganizationUnitDto, VehicleDto, VehicleRequest, VehicleTypeDto } from "./api";

type VehicleDraft = {
  vehicleTypeId: string;
  facilityId: string;
  status: string;
  brand: string;
  model: string;
  color: string;
  yearOfManufacture: string;
  hourlyPrice: string;
  longtermPrice: string;
  description: string;
  mainImageUrl: string;
  location: string;
  seatCount: string;
  transmission: string;
  trunkCapacity: string;
  bikeType: string;
  hasStorageBox: string;
  batteryCapacity: string;
  chargingType: string;
  chargingTimeHours: string;
  maxRangeKm: string;
  batteryType: string;
  galleryImages: string[];
};

const emptyDraft: VehicleDraft = {
  vehicleTypeId: "",
  facilityId: "",
  status: "available",
  brand: "",
  model: "",
  color: "",
  yearOfManufacture: "",
  hourlyPrice: "",
  longtermPrice: "",
  description: "",
  mainImageUrl: "",
  location: "",
  seatCount: "",
  transmission: "",
  trunkCapacity: "",
  bikeType: "",
  hasStorageBox: "false",
  batteryCapacity: "",
  chargingType: "",
  chargingTimeHours: "",
  maxRangeKm: "",
  batteryType: "",
  galleryImages: [],
};

const statuses = [
  { value: "available", label: "Sẵn sàng" },
  { value: "rented", label: "Đang thuê" },
  { value: "maintenance", label: "Đang bảo dưỡng" },
  { value: "unavailable", label: "Tạm ngưng" },
];

export default function VehicleForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<VehicleDraft>(emptyDraft);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);
  const [facilities, setFacilities] = useState<OrganizationUnitDto[]>([]);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageDragActive, setImageDragActive] = useState(false);
  const [error, setError] = useState("");
  const isEditing = vehicleId !== null;
  const selectedVehicleType = vehicleTypes.find(
    (item) => String(item.id) === draft.vehicleTypeId,
  );
  const vehicleKind = getVehicleKind(selectedVehicleType);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        try {
          const [types, facilityList] = await Promise.all([getVehicleTypes(), getFacilities()]);
          setVehicleTypes(types);
          setFacilities(facilityList);
          const idString = new URLSearchParams(window.location.search).get("vehicleId");
          if (idString) {
            const id = Number(idString);
            if (!Number.isInteger(id) || id < 1) throw new Error("ID phương tiện không hợp lệ.");
            const vehicle = await getVehicle(id);
            setVehicleId(id);
            setDraft(fromVehicle(vehicle));
          }
        } catch (loadError) {
          setError(messageOf(loadError, "Không thể tải dữ liệu cho biểu mẫu phương tiện."));
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const updateDraft = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.currentTarget;
    if (name === "vehicleTypeId" && value !== draft.vehicleTypeId) {
      setDraft((current) => ({
        ...current,
        vehicleTypeId: value,
        seatCount: "",
        transmission: "",
        trunkCapacity: "",
        bikeType: "",
        hasStorageBox: "false",
        batteryCapacity: "",
        chargingType: "",
        chargingTimeHours: "",
        maxRangeKm: "",
        batteryType: "",
      }));
    } else {
      setDraft((current) => ({ ...current, [name]: value }));
    }
    setError("");
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    await uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      setError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const response = await uploadVehicleImage(file);
        const imageUrl = extractImageUrl(response);
        if (!imageUrl) {
          throw new Error(`API tải ảnh "${file.name}" thành công nhưng không trả về URL ảnh.`);
        }
        setDraft((current) => current.mainImageUrl
          ? { ...current, galleryImages: [...current.galleryImages, imageUrl] }
          : { ...current, mainImageUrl: imageUrl });
      }
    } catch (uploadError) {
      setError(messageOf(uploadError, "Không thể tải ảnh lên."));
    } finally {
      setUploading(false);
    }
  };

  const handleImageDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setImageDragActive(true);
  };

  const handleImageDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
      setImageDragActive(false);
    }
  };

  const handleImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setImageDragActive(false);
    void uploadFiles(Array.from(event.dataTransfer.files));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const vehicleTypeId = Number(draft.vehicleTypeId);
    if (!Number.isInteger(vehicleTypeId) || !vehicleTypes.some((item) => item.id === vehicleTypeId)) {
      setError("Vui lòng chọn một loại phương tiện hợp lệ.");
      return;
    }
    setSaving(true);
    setError("");
    const detail = {
      seatCount: vehicleKind.isCar ? optionalNumber(draft.seatCount) : null,
      transmission: vehicleKind.isCar ? draft.transmission || null : null,
      trunkCapacity: vehicleKind.isCar ? optionalNumber(draft.trunkCapacity) : null,
      bikeType: vehicleKind.isMotorbike ? draft.bikeType || null : null,
      hasStorageBox: vehicleKind.isMotorbike ? draft.hasStorageBox === "true" : null,
      batteryCapacity: vehicleKind.isElectric ? draft.batteryCapacity || null : null,
      chargingType: vehicleKind.isElectric ? draft.chargingType || null : null,
      chargingTimeHours: vehicleKind.isElectric ? draft.chargingTimeHours || null : null,
      maxRangeKm: vehicleKind.isElectric ? optionalNumber(draft.maxRangeKm) : null,
      batteryType: vehicleKind.isElectric ? draft.batteryType || null : null,
      galleryImages: draft.galleryImages,
    };
    const body: VehicleRequest = {
      vehicleTypeId,
      facilityId: draft.facilityId ? Number(draft.facilityId) : null,
      status: draft.status,
      brand: draft.brand.trim(),
      model: draft.model.trim(),
      color: draft.color.trim(),
      yearOfManufacture: optionalNumber(draft.yearOfManufacture),
      hourlyPrice: optionalNumber(draft.hourlyPrice),
      longtermPrice: optionalNumber(draft.longtermPrice),
      description: draft.description.trim(),
      mainImageUrl: draft.mainImageUrl,
      location: draft.location.trim(),
      detail,
    };

    try {
      if (vehicleId !== null) await updateVehicle(vehicleId, body);
      else await createVehicle(body);
      router.push("/admin/vehicles");
    } catch (saveError) {
      setError(messageOf(saveError, "Không thể lưu phương tiện."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/admin/vehicles" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-800"><ArrowLeft className="h-4 w-4" /> Quay lại danh sách phương tiện</Link>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Quản lý đội xe</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{isEditing ? "Chỉnh sửa phương tiện" : "Thêm phương tiện mới"}</h2>
        <p className="mt-2 text-sm text-slate-500">Thông tin được lưu trực tiếp vào hệ thống quản lý.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
          <h3 className="border-b border-slate-100 pb-4 text-base font-bold text-slate-900">Thông tin phương tiện</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Loại phương tiện" htmlFor="vehicleTypeId"><select id="vehicleTypeId" name="vehicleTypeId" required value={draft.vehicleTypeId} onChange={updateDraft} className="admin-input"><option value="" disabled>Chọn loại phương tiện</option>{vehicleTypes.map((item) => <option key={item.id} value={item.id}>{item.name} {item.fuelType ? `· ${item.fuelType}` : ""}</option>)}</select></Field>
            <Field label="Chi nhánh" htmlFor="facilityId"><select id="facilityId" name="facilityId" value={draft.facilityId} onChange={updateDraft} className="admin-input"><option value="">Chưa phân công</option>{facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
            <Field label="Hãng xe" htmlFor="brand"><input id="brand" name="brand" required value={draft.brand} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Dòng xe / mẫu xe" htmlFor="model"><input id="model" name="model" required value={draft.model} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Màu sắc" htmlFor="color"><input id="color" name="color" value={draft.color} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Năm sản xuất" htmlFor="yearOfManufacture"><input id="yearOfManufacture" name="yearOfManufacture" type="number" min="1990" max="2035" value={draft.yearOfManufacture} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Trạng thái" htmlFor="status"><select id="status" name="status" required value={draft.status} onChange={updateDraft} className="admin-input">{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>
            <Field label="Vị trí hiện tại" htmlFor="location"><input id="location" name="location" value={draft.location} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Giá thuê theo giờ (₫)" htmlFor="hourlyPrice"><input id="hourlyPrice" name="hourlyPrice" type="number" min="0" step="1000" value={draft.hourlyPrice} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Giá thuê dài hạn (₫)" htmlFor="longtermPrice"><input id="longtermPrice" name="longtermPrice" type="number" min="0" step="100000" value={draft.longtermPrice} onChange={updateDraft} className="admin-input" /></Field>
          </div>
          <div className="mt-5"><Field label="Mô tả" htmlFor="description"><textarea id="description" name="description" rows={3} value={draft.description} onChange={updateDraft} className="admin-input resize-y" /></Field></div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
          <h3 className="border-b border-slate-100 pb-4 text-base font-bold text-slate-900">Thông số kỹ thuật</h3>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {vehicleKind.isCar && (
              <>
                <Field label="Số chỗ ngồi" htmlFor="seatCount"><input id="seatCount" name="seatCount" type="number" min="1" value={draft.seatCount} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Hộp số" htmlFor="transmission"><input id="transmission" name="transmission" value={draft.transmission} onChange={updateDraft} placeholder="Tự động / Số sàn" className="admin-input" /></Field>
                <Field label="Dung tích cốp (lít)" htmlFor="trunkCapacity"><input id="trunkCapacity" name="trunkCapacity" type="number" min="0" value={draft.trunkCapacity} onChange={updateDraft} className="admin-input" /></Field>
              </>
            )}
            {vehicleKind.isMotorbike && (
              <>
                <Field label="Loại xe máy" htmlFor="bikeType"><input id="bikeType" name="bikeType" value={draft.bikeType} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Có cốp chứa đồ" htmlFor="hasStorageBox"><select id="hasStorageBox" name="hasStorageBox" value={draft.hasStorageBox} onChange={updateDraft} className="admin-input"><option value="false">Không</option><option value="true">Có</option></select></Field>
              </>
            )}
            {vehicleKind.isElectric && (
              <>
                <Field label="Dung lượng pin" htmlFor="batteryCapacity"><input id="batteryCapacity" name="batteryCapacity" value={draft.batteryCapacity} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Loại pin" htmlFor="batteryType"><input id="batteryType" name="batteryType" value={draft.batteryType} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Chuẩn sạc" htmlFor="chargingType"><input id="chargingType" name="chargingType" value={draft.chargingType} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Thời gian sạc (giờ)" htmlFor="chargingTimeHours"><input id="chargingTimeHours" name="chargingTimeHours" value={draft.chargingTimeHours} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Quãng đường tối đa (km)" htmlFor="maxRangeKm"><input id="maxRangeKm" name="maxRangeKm" type="number" min="0" value={draft.maxRangeKm} onChange={updateDraft} className="admin-input" /></Field>
              </>
            )}
            {!draft.vehicleTypeId && <p className="text-sm text-slate-500 sm:col-span-2">Chọn loại phương tiện để hiển thị thông số phù hợp.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
          <h3 className="border-b border-slate-100 pb-4 text-base font-bold text-slate-900">Hình ảnh</h3>
          <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <Field label="Tải ảnh lên (có thể chọn nhiều ảnh)" htmlFor="vehicleImage"><input ref={fileRef} id="vehicleImage" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadImage} disabled={uploading} className="block w-full rounded-xl border border-slate-200 text-sm file:mr-4 file:border-0 file:bg-emerald-50 file:px-4 file:py-3 file:font-semibold file:text-emerald-800" /></Field>
              {uploading && <p role="status" className="text-sm text-slate-500">Đang tải ảnh lên...</p>}
            </div>
            <div
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
              onDrop={handleImageDrop}
              className={`grid min-h-32 grid-cols-2 gap-3 rounded-xl transition ${
                imageDragActive ? "bg-emerald-50 ring-2 ring-emerald-500 ring-offset-2" : ""
              }`}
            >
              {draft.mainImageUrl ? (
                <ImagePreview
                  src={draft.mainImageUrl}
                  label="Ảnh chính"
                  onRemove={() => setDraft((current) => {
                    const [nextMainImageUrl, ...galleryImages] = current.galleryImages;
                    return { ...current, mainImageUrl: nextMainImageUrl ?? "", galleryImages };
                  })}
                />
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      fileRef.current?.click();
                    }
                  }}
                  className={`flex min-h-32 cursor-pointer items-center justify-center rounded-xl border border-dashed text-center transition ${
                    imageDragActive
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-slate-50 text-slate-400 hover:border-emerald-400 hover:text-emerald-700"
                  }`}
                >
                  <div>
                    <ImagePlus className="mx-auto h-7 w-7" />
                    <span className="mt-2 block text-xs">
                      {imageDragActive ? "Thả ảnh vào đây" : "Ảnh chính · Thả hoặc chọn ảnh"}
                    </span>
                  </div>
                </div>
              )}
              {draft.galleryImages.map((imageUrl, index) => (
                <ImagePreview
                  key={`${imageUrl}-${index}`}
                  src={imageUrl}
                  label={`Ảnh ${index + 2}`}
                  onRemove={() => setDraft((current) => ({
                    ...current,
                    galleryImages: current.galleryImages.filter((_, imageIndex) => imageIndex !== index),
                  }))}
                />
              ))}
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" />Ảnh được tải lên qua endpoint `/api/media/vehicle`.</p>
        </section>

        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Link href="/admin/vehicles" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">Hủy</Link>
          <button type="submit" disabled={loading || saving || uploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"><Save className="h-4 w-4" />{loading ? "Đang tải..." : saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm phương tiện"}</button>
        </div>
      </form>
    </div>
  );
}

function fromVehicle(vehicle: VehicleDto): VehicleDraft {
  const detail = vehicle.detail;
  return {
    vehicleTypeId: String(vehicle.vehicleTypeId),
    facilityId: vehicle.facilityId === null ? "" : String(vehicle.facilityId),
    status: vehicle.status ?? "available",
    brand: vehicle.brand ?? "",
    model: vehicle.model ?? "",
    color: vehicle.color ?? "",
    yearOfManufacture: vehicle.yearOfManufacture === null ? "" : String(vehicle.yearOfManufacture),
    hourlyPrice: vehicle.hourlyPrice === null ? "" : String(vehicle.hourlyPrice),
    longtermPrice: vehicle.longtermPrice === null ? "" : String(vehicle.longtermPrice),
    description: vehicle.description ?? "",
    mainImageUrl: vehicle.mainImageUrl ?? "",
    location: vehicle.location ?? "",
    seatCount: detail?.seatCount == null ? "" : String(detail.seatCount),
    transmission: detail?.transmission ?? "",
    trunkCapacity: detail?.trunkCapacity == null ? "" : String(detail.trunkCapacity),
    bikeType: detail?.bikeType ?? "",
    hasStorageBox: detail?.hasStorageBox ? "true" : "false",
    batteryCapacity: detail?.batteryCapacity ?? "",
    chargingType: detail?.chargingType ?? "",
    chargingTimeHours: detail?.chargingTimeHours ?? "",
    maxRangeKm: detail?.maxRangeKm == null ? "" : String(detail.maxRangeKm),
    batteryType: detail?.batteryType ?? "",
    galleryImages: detail?.galleryImages ?? [],
  };
}

function optionalNumber(value: string): number | null {
  return value.trim() === "" ? null : Number(value);
}

function getVehicleKind(vehicleType: VehicleTypeDto | undefined) {
  const typeName = `${vehicleType?.name ?? ""} ${vehicleType?.fuelType ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase();
  const isElectric = /\bdien\b|electric|ev\b/.test(typeName);
  const isMotorbike = /xe may|motorbike|motorcycle|scooter|moped/.test(typeName);
  const isCar = /o to|oto|car|automobile/.test(typeName) || !isMotorbike;
  return { isCar, isMotorbike, isElectric };
}

function extractImageUrl(value: unknown): string | undefined {
  if (typeof value === "string") {
    const candidate = value.trim();
    return /^(https?:\/\/|\/\/|\/|data:image\/)/i.test(candidate) ? candidate : undefined;
  }
  if (typeof value !== "object" || value === null) return undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const imageUrl = extractImageUrl(item);
      if (imageUrl) return imageUrl;
    }
    return undefined;
  }
  const data = value as Record<string, unknown>;
  for (const key of [
    "url",
    "imageUrl",
    "mainImageUrl",
    "fileUrl",
    "secure_url",
    "secureUrl",
    "publicUrl",
    "assetUrl",
    "filePath",
    "path",
    "location",
    "data",
    "result",
  ]) {
    const imageUrl = extractImageUrl(data[key]);
    if (imageUrl) return imageUrl;
  }
  return undefined;
}

function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return <div><label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>{children}</div>;
}

function ImagePreview({ src, label, onRemove }: { src: string; label: string; onRemove: () => void }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="relative min-h-32 overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
    >
      <Image src={src} alt={label} fill unoptimized sizes="(max-width: 768px) 50vw, 320px" className="object-cover" />
      <span className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700">{label}</span>
      <button type="button" onClick={onRemove} aria-label={`Xóa ${label.toLocaleLowerCase()}`} className="absolute right-2 top-2 rounded-lg bg-white/90 p-2 text-slate-600 shadow hover:text-red-700"><X className="h-4 w-4" /></button>
    </div>
  );
}
