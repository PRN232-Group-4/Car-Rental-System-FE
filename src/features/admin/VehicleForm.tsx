"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { InlineError, InlineInput, InlineSelect, InlineTextarea, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import Link from "@/components/navigation/NavigationLink";
import VehicleImage from "@/components/ui/VehicleImage";
import { useQueryClient } from "@tanstack/react-query";
import { vehicleQueryOptions } from "./vehicle-query";
import { useNavigationRouter as useRouter } from "@/components/navigation/NavigationProvider";
import { ArrowLeft, ImagePlus, Info, Save, X } from "lucide-react";
import {
  createVehicle,
  getFacilities,
  getVehicleTypes,
  updateVehicle,
  uploadVehicleImage,
} from "./api";
import type { OrganizationUnitDto, VehicleDto, VehicleRequest, VehicleTypeDto } from "./api";
import { getVehicleKind } from "./vehicle-category";
import { useAuth } from "@/features/auth";
import { notifyError, notifySuccess } from "@/components/ui/Toaster";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { FormField as Field } from "@/components/ui/FormField";
import { FormSkeleton } from "@/components/ui/Skeleton";
import VehicleTrackingPanel from "@/features/maps/VehicleTrackingPanel";
import { TransitFolio } from "@/features/admin/transit-desk/TransitFolio";
import VehicleMaintenanceTechnicians from "./VehicleMaintenanceTechnicians";

import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { VehicleIdentity } from "@/features/admin/VehicleName";
import { VehiclePhotoGrid } from "./VehiclePhotos";
import VehicleLicenseConfig, { parseAllowedLicenseTypes } from "./VehicleLicenseConfig";

type VehicleDraft = {
  allowedLicenseTypes: string;
  licensePlate: string;
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
  allowedLicenseTypes: "",
  licensePlate: "",
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

export default function VehicleForm({ onClose, onSaved, editingVehicleId }: { onClose?: () => void; onSaved?: () => void; editingVehicleId?: number } = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const canManage = hasRole("admin") || hasRole("manager");

  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<VehicleDraft>(emptyDraft);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);
  const [facilities, setFacilities] = useState<OrganizationUnitDto[]>([]);
  const [vehicleId, setVehicleId] = useState<number | null>(editingVehicleId ?? null);
  const [persistedVehicle, setPersistedVehicle] = useState<VehicleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageDragActive, setImageDragActive] = useState(false);
  const [error, setError] = useState("");
  const validation = useInlineValidation();
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
          const idString = editingVehicleId != null ? String(editingVehicleId) : onClose ? null : (new URLSearchParams(window.location.search).get("id") ?? new URLSearchParams(window.location.search).get("vehicleId"));
          if (idString) {
            const id = Number(idString);
            if (!Number.isInteger(id) || id < 1) throw new Error("ID phương tiện không hợp lệ.");
            const vehicle = await queryClient.fetchQuery(vehicleQueryOptions(id));
            setVehicleId(id);
            setPersistedVehicle(vehicle);
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
  }, [editingVehicleId, onClose, queryClient]);

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
      validation.setField("vehicleImage", "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    setUploading(true);
    validation.clear("vehicleImage");
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
      validation.setField("vehicleImage", messageOf(uploadError, "Không thể tải ảnh lên."));
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
    if (!canManage) {
      setError("Bạn không có quyền lưu thay đổi.");
      return;
    }
    const vehicleTypeId = Number(draft.vehicleTypeId);
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
      allowedLicenseTypes: parseAllowedLicenseTypes(draft.allowedLicenseTypes),
      vehicleTypeId,
      licensePlate: draft.licensePlate.trim() || null,
      facilityId: draft.facilityId ? Number(draft.facilityId) : null,
      status: draft.status,
      brand: draft.brand.trim(),
      model: draft.model.trim(),
      color: draft.color.trim(),
      yearOfManufacture: optionalNumber(draft.yearOfManufacture),
      hourlyPrice: optionalNumber(draft.hourlyPrice),
      longtermPrice: optionalNumber(draft.longtermPrice),
      description: draft.description.trim(),
      mainImageUrl: draft.mainImageUrl || null,
      location: draft.location.trim(),
      detail,
    };

    try {
      if (vehicleId !== null) {
        await updateVehicle(vehicleId, body);
        await queryClient.invalidateQueries({ queryKey: vehicleQueryOptions(vehicleId).queryKey });
      }
      else await createVehicle(body);
      notifySuccess(vehicleId !== null ? "Đã cập nhật phương tiện." : "Đã thêm phương tiện mới.");
      if (onSaved) onSaved();
      else router.push("/admin/vehicles");
    } catch (saveError) {
      const message = saveError instanceof TypeError ? messageOf(saveError, "Không thể lưu phương tiện.") : validation.report(saveError);
      setError(message);
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <div className="mx-auto max-w-xl text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-td-ink">Quyền truy cập bị giới hạn</h2>
        <p className="text-sm text-td-muted">Chỉ Quản trị viên và Quản lý mới có quyền thêm hoặc chỉnh sửa phương tiện.</p>
        <Link href="/admin/vehicles" className="inline-flex items-center gap-2 text-sm font-semibold text-td-oxide hover:text-td-oxide-hover">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách phương tiện
        </Link>
      </div>
    );
  }

  const content = (
    <div className="min-w-0 space-y-8">
      {!onClose && <>
        <Link href="/admin/vehicles" className="inline-flex items-center gap-2 text-xs font-semibold text-td-muted transition hover:text-td-oxide"><ArrowLeft className="h-4 w-4" /> Quay lại danh sách phương tiện</Link>
        <TransitFolio
          index="02"
          tag="FLT"
          kicker="TÀI SẢN · HỒ SƠ PHƯƠNG TIỆN"
          title={loading ? <>Hồ sơ <em className="italic text-td-teal">phương tiện.</em></> : isEditing ? <>Chỉnh sửa <em className="italic text-td-teal">phương tiện.</em></> : <>Thêm <em className="italic text-td-teal">phương tiện mới.</em></>}
          description="Cập nhật hồ sơ, giá thuê và thông số kỹ thuật theo từng loại xe."
        />
      </>}
      {error && <p role="alert" className="rounded border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">{error}</p>}

      {selectedVehicleType && !vehicleKind.isValid && <p role="alert" className="text-sm text-danger">Loại xe chưa được cấu hình nhóm xe và nhiên liệu hợp lệ. Hãy cập nhật tại mục Loại phương tiện.</p>}
      {loading ? <FormSkeleton label="Đang tải thông tin phương tiện..." fields={10} /> : <ValidatedForm validation={validation} validate={() => {
        const errors: Record<string, string> = {};
        const licenseTypes = parseAllowedLicenseTypes(draft.allowedLicenseTypes);
        if (licenseTypes.length > 30 || licenseTypes.some((type) => !/^[A-Z0-9]{1,20}$/.test(type))) {
          errors.allowedLicenseTypes = "Chọn tối đa 30 hạng bằng. Hạng khác chỉ gồm 1–20 chữ cái hoặc chữ số, cách nhau bằng dấu phẩy.";
        }
        const typeId = Number(draft.vehicleTypeId);
        if (!Number.isInteger(typeId) || !vehicleTypes.some((item) => item.id === typeId)) {
          errors.vehicleTypeId = "Vui lòng chọn một loại phương tiện hợp lệ.";
        } else if (!vehicleKind.isValid) {
          errors.vehicleTypeId = "Loại xe chưa được cấu hình đúng nhóm xe và nhiên liệu.";
        }
        return errors;
      }} onSubmit={submit} className="space-y-6">
        <div className={onClose ? "space-y-6" : "grid min-w-0 items-start gap-8 lg:grid-cols-12"}>
          {!onClose && (
            <aside aria-labelledby="vehicle-profile-title" className="min-w-0 space-y-5 rounded border border-td-rule bg-td-white p-6 lg:col-span-4">
              <h2 id="vehicle-profile-title" className="text-sm font-bold text-td-ink">Hồ sơ phương tiện</h2>
              <VehicleIdentity vehicle={draft} />
              <VehiclePhotoGrid vehicle={{ ...draft, detail: { galleryImages: draft.galleryImages } }} />
              <AdminStatusBadge domain="vehicle" status={draft.status}>
                {statuses.find((item) => item.value === draft.status)?.label ?? draft.status}
              </AdminStatusBadge>
              <dl className="divide-y divide-td-rule text-sm">
                <div className="flex flex-wrap justify-between gap-2 py-3">
                  <dt className="font-mono text-[11px] uppercase text-td-muted">Loại xe</dt>
                  <dd className="min-w-0 break-words text-right font-semibold text-td-ink">{selectedVehicleType?.name || "Chưa chọn"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-3">
                  <dt className="font-mono text-[11px] uppercase text-td-muted">Biển số</dt>
                  <dd className="min-w-0 break-words font-mono text-td-ink">{draft.licensePlate || "Chưa cập nhật"}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-3">
                  <dt className="font-mono text-[11px] uppercase text-td-muted">Chi nhánh</dt>
                  <dd className="min-w-0 break-words text-right font-semibold text-td-ink">{facilities.find((item) => String(item.id) === draft.facilityId)?.name || "Chưa phân công"}</dd>
                </div>
              </dl>
              <p className="border-l-2 border-td-oxide pl-3 text-xs leading-relaxed text-td-muted">Thông số hiển thị theo nhóm xe và nhiên liệu của loại phương tiện đã chọn.</p>
            </aside>
          )}
          <div className={onClose ? "min-w-0 space-y-6" : "min-w-0 space-y-8 lg:col-span-8"}>
        <section aria-labelledby="vehicle-general-title" className="min-w-0 border-t border-td-ink pt-5">
          <h2 id="vehicle-general-title" className="text-sm font-bold text-td-ink">Thông tin phương tiện</h2>
          {persistedVehicle && <div className="mt-4"><VehicleMaintenanceTechnicians vehicle={persistedVehicle} /></div>}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Loại phương tiện" htmlFor="vehicleTypeId"><InlineSelect id="vehicleTypeId" name="vehicleTypeId" required value={draft.vehicleTypeId} onChange={updateDraft} className="admin-input"><option value="" disabled>Chọn loại phương tiện</option>{vehicleTypes.map((item) => <option key={item.id} value={item.id}>{item.name} {item.fuelType ? `· ${item.fuelType}` : ""}</option>)}</InlineSelect></Field>
            <Field label="Chi nhánh" htmlFor="facilityId"><InlineSelect id="facilityId" name="facilityId" value={draft.facilityId} onChange={updateDraft} className="admin-input"><option value="">Chưa phân công</option>{facilities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</InlineSelect></Field>
            <Field label="Biển số" htmlFor="licensePlate"><InlineInput id="licensePlate" name="licensePlate" maxLength={255} value={draft.licensePlate} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Hãng xe" htmlFor="brand"><InlineInput id="brand" name="brand" required value={draft.brand} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Dòng xe / mẫu xe" htmlFor="model"><InlineInput id="model" name="model" required value={draft.model} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Màu sắc" htmlFor="color"><InlineInput id="color" name="color" value={draft.color} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Năm sản xuất" htmlFor="yearOfManufacture"><InlineInput id="yearOfManufacture" name="yearOfManufacture" type="number" min="1990" max="2035" value={draft.yearOfManufacture} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Trạng thái" htmlFor="status"><InlineSelect id="status" name="status" required value={draft.status} onChange={updateDraft} className="admin-input">{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</InlineSelect></Field>
            <Field label="Vị trí hiện tại" htmlFor="location"><InlineInput id="location" name="location" value={draft.location} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Giá thuê theo giờ (₫)" htmlFor="hourlyPrice"><InlineInput id="hourlyPrice" name="hourlyPrice" type="number" min="0" step="1000" value={draft.hourlyPrice} onChange={updateDraft} className="admin-input" /></Field>
            <Field label="Giá thuê dài hạn (₫)" htmlFor="longtermPrice"><InlineInput id="longtermPrice" name="longtermPrice" type="number" min="0" step="100000" value={draft.longtermPrice} onChange={updateDraft} className="admin-input" /></Field>
          </div>
          <div className="mt-5"><VehicleLicenseConfig value={draft.allowedLicenseTypes} disabled={saving || uploading} error={validation.errors.allowedLicenseTypes} onChange={(value) => {
            setDraft((current) => ({ ...current, allowedLicenseTypes: value }));
            validation.clear("allowedLicenseTypes");
          }} /></div>
          <div className="mt-5"><Field label="Mô tả" htmlFor="description"><InlineTextarea id="description" name="description" rows={3} value={draft.description} onChange={updateDraft} className="admin-input resize-y" /></Field></div>
        </section>

        <section aria-labelledby="vehicle-specifications-title" className="min-w-0 border-t border-td-ink pt-5">
          <h2 id="vehicle-specifications-title" className="text-sm font-bold text-td-ink">Thông số kỹ thuật</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {vehicleKind.isCar && (
              <>
                <Field label="Số chỗ ngồi" htmlFor="seatCount"><InlineInput id="seatCount" name="seatCount" type="number" min="1" value={draft.seatCount} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Hộp số" htmlFor="transmission"><InlineInput id="transmission" name="transmission" value={draft.transmission} onChange={updateDraft} placeholder="Tự động / Số sàn" className="admin-input" /></Field>
                <Field label="Dung tích cốp (lít)" htmlFor="trunkCapacity"><InlineInput id="trunkCapacity" name="trunkCapacity" type="number" min="0" value={draft.trunkCapacity} onChange={updateDraft} className="admin-input" /></Field>
              </>
            )}
            {vehicleKind.isMotorbike && (
              <>
                <Field label="Loại xe máy" htmlFor="bikeType"><InlineInput id="bikeType" name="bikeType" value={draft.bikeType} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Có cốp chứa đồ" htmlFor="hasStorageBox"><InlineSelect id="hasStorageBox" name="hasStorageBox" value={draft.hasStorageBox} onChange={updateDraft} className="admin-input"><option value="false">Không</option><option value="true">Có</option></InlineSelect></Field>
              </>
            )}
            {vehicleKind.isElectric && (
              <>
                <Field label="Dung lượng pin" htmlFor="batteryCapacity"><InlineInput id="batteryCapacity" name="batteryCapacity" value={draft.batteryCapacity} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Loại pin" htmlFor="batteryType"><InlineInput id="batteryType" name="batteryType" value={draft.batteryType} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Chuẩn sạc" htmlFor="chargingType"><InlineInput id="chargingType" name="chargingType" value={draft.chargingType} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Thời gian sạc (giờ)" htmlFor="chargingTimeHours"><InlineInput id="chargingTimeHours" name="chargingTimeHours" value={draft.chargingTimeHours} onChange={updateDraft} className="admin-input" /></Field>
                <Field label="Quãng đường tối đa (km)" htmlFor="maxRangeKm"><InlineInput id="maxRangeKm" name="maxRangeKm" type="number" min="0" value={draft.maxRangeKm} onChange={updateDraft} className="admin-input" /></Field>
              </>
            )}
            {!draft.vehicleTypeId && <p className="text-sm text-td-muted sm:col-span-2">Chọn loại phương tiện để hiển thị thông số phù hợp.</p>}
          </div>
        </section>

        <section aria-labelledby="vehicle-images-title" className="min-w-0 border-t border-td-ink pt-5">
          <h2 id="vehicle-images-title" className="text-sm font-bold text-td-ink">Hình ảnh</h2>
          <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-4">
              <Field label="Tải ảnh lên (có thể chọn nhiều ảnh)" htmlFor="vehicleImage"><input ref={fileRef} id="vehicleImage" name="vehicleImage" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadImage} disabled={uploading} aria-invalid={!!validation.errors.vehicleImage} aria-describedby={validation.errors.vehicleImage ? "vehicleImage-error" : undefined} className={`block w-full min-w-0 rounded border text-sm file:mr-3 file:border-0 file:bg-td-chalk file:px-3 file:py-3 file:font-semibold file:text-td-oxide ${validation.errors.vehicleImage ? "border-danger ring-1 ring-danger" : "border-td-rule"}`} /><InlineError name="vehicleImage" inputId="vehicleImage" /></Field>
              {uploading && <p role="status" className="text-sm text-td-muted">Đang tải ảnh lên...</p>}
            </div>
            <div
              onDragOver={handleImageDragOver}
              onDragLeave={handleImageDragLeave}
              onDrop={handleImageDrop}
              className={`grid min-h-32 grid-cols-2 gap-3 rounded transition ${
                imageDragActive ? "bg-td-chalk ring-2 ring-td-oxide ring-offset-2" : ""
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
                  className={`flex min-h-32 cursor-pointer items-center justify-center rounded border border-dashed text-center transition only:col-span-2 ${
                    imageDragActive
                      ? "border-td-oxide bg-td-chalk text-td-oxide"
                      : "border-td-rule bg-td-paper text-td-muted hover:border-td-oxide/50 hover:text-td-oxide"
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
          <p className="mt-4 flex items-start gap-2 text-xs text-td-muted"><Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />Hỗ trợ JPG, PNG hoặc WEBP. Ảnh đầu tiên được dùng làm ảnh chính.</p>
        </section>

        {isEditing && vehicleId != null && <VehicleTrackingPanel vehicleId={vehicleId} />}
          </div>
        </div>
        <FormDialogFooter>
          {onClose ? <button type="button" disabled={saving || uploading} onClick={onClose} className="rounded border border-td-rule bg-td-white px-5 py-3 text-center text-sm font-semibold text-td-ink hover:bg-td-paper disabled:opacity-60">Hủy</button> : <Link href="/admin/vehicles" className="rounded border border-td-rule bg-td-white px-5 py-3 text-center text-sm font-semibold text-td-ink hover:bg-td-paper">Hủy</Link>}
          <button type="submit" disabled={loading || saving || uploading || !vehicleKind.isValid} className="inline-flex items-center justify-center gap-2 rounded bg-td-oxide px-5 py-3 text-sm font-semibold text-white hover:bg-td-oxide-hover disabled:cursor-wait disabled:opacity-60"><Save className="h-4 w-4" />{loading ? "Đang tải..." : saving ? "Đang lưu..." : isEditing ? "Lưu thay đổi" : "Thêm phương tiện"}</button>
        </FormDialogFooter>
      </ValidatedForm>}
    </div>
  );

  return onClose ? <FormDialog title={isEditing ? "Chỉnh sửa phương tiện" : "Thêm phương tiện mới"} onClose={onClose} busy={saving || uploading} size="xl">{content}</FormDialog> : content;
}

function fromVehicle(vehicle: VehicleDto): VehicleDraft {
  const detail = vehicle.detail;
  return {
    allowedLicenseTypes: (vehicle.allowedLicenseTypes ?? []).join(", "),
    licensePlate: vehicle.licensePlate ?? "",
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
  if (error instanceof TypeError) return `${fallback} Vui lòng kiểm tra kết nối mạng và thử lại.`;
  return error instanceof Error ? error.message : fallback;
}


function ImagePreview({ src, label, onRemove }: { src: string; label: string; onRemove: () => void }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="relative min-h-32 overflow-hidden rounded border border-td-rule bg-td-chalk only:col-span-2"
    >
      <span className="absolute inset-0"><VehicleImage src={src} alt={label} loading="eager" className="h-full w-full" /></span>
      <span className="absolute bottom-2 left-2 rounded bg-td-white/90 px-2 py-1 text-xs font-semibold text-td-ink">{label}</span>
      <button type="button" onClick={onRemove} aria-label={`Xóa ${label.toLocaleLowerCase()}`} className="absolute right-2 top-2 rounded bg-td-white/90 p-2 text-td-muted hover:text-danger"><X className="h-4 w-4" /></button>
    </div>
  );
}
