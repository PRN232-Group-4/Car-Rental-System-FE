"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  createRentalPolicy,
  createSubscriptionPlan,
  createVehicleType,
  deleteSubscriptionPlan,
  deleteVehicleType,
  getRentalPolicies,
  getSubscriptionPlans,
  getVehicleTypes,
  setRentalPolicyStatus,
  updateSubscriptionPlan,
  updateVehicleType,
} from "./api";
import type { RentalPolicyDto, SubscriptionPlanDto, VehicleTypeDto } from "./api";
import { useAuth } from "@/features/auth";
import { notifyApiError, notifyError, notifySuccess } from "@/components/ui/Toaster";
import { InlineInput, InlineSelect, InlineTextarea, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import FormDialog, { FormDialogFooter } from "@/components/ui/FormDialog";
import { AdminTable, AdminTableCard, AdminTableEmptyRow } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { AdminRowAction } from "@/components/admin/AdminRowAction";
import { Skeleton } from "@/components/ui/Skeleton";
import { TransitFolio, TransitFolioMetric } from "@/features/admin/transit-desk/TransitFolio";

type CatalogKey = "vehicle-types" | "policies" | "subscription-plans";
type CatalogRecord = { id: number; values: Record<string, string>; active: boolean };
type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  required?: boolean;
  max?: number;
  options?: { value: string; label: string }[];
};

const catalogInfo: Record<CatalogKey, { title: string; description: string }> = {
  "vehicle-types": {
    title: "Loại phương tiện",
    description: "Quản lý loại phương tiện và nhiên liệu mặc định.",
  },
  policies: {
    title: "Chính sách thuê xe",
    description: "Cấu hình VAT, phí trễ giờ và đặt cọc cho từng loại phương tiện.",
  },
  "subscription-plans": {
    title: "Gói đăng ký",
    description: "Quản lý gói thuê bao, thời hạn, số giờ sử dụng và quyền lợi.",
  },
};

const fieldsByCatalog: Record<CatalogKey, Field[]> = {
  "vehicle-types": [
    { key: "name", label: "Tên loại phương tiện", required: true },
    { key: "type", label: "Nhóm xe", type: "select", required: true, options: [{ value: "car", label: "Ô tô" }] },
    {
      key: "fuelType",
      label: "Nhiên liệu",
      type: "select",
      required: true,
      options: [
        { value: "gasoline", label: "Xăng" },
        { value: "electric", label: "Điện" },
      ],
    },
  ],
  policies: [
    { key: "name", label: "Tên chính sách", required: true },
    { key: "vehicleTypeId", label: "Loại phương tiện", type: "select" },
    { key: "vatRate", label: "Thuế VAT (%)", type: "number", required: true, max: 100 },
    { key: "overtimeFeeRate", label: "Phí trễ giờ (%)", type: "number", required: true, max: 100 },
    { key: "depositPercentage", label: "Tỷ lệ đặt cọc (%)", type: "number", required: true, max: 100 },
  ],
  "subscription-plans": [
    { key: "name", label: "Tên gói thuê bao", required: true },
    { key: "description", label: "Mô tả / quyền lợi", type: "textarea" },
    { key: "price", label: "Giá gói (₫)", type: "number", required: true },
    { key: "durationDays", label: "Thời hạn (ngày)", type: "number", required: true },
    { key: "includedHours", label: "Số giờ bao gồm", type: "number" },
    {
      key: "isActive",
      label: "Trạng thái",
      type: "select",
      required: true,
      options: [
        { value: "true", label: "Đang hoạt động" },
        { value: "false", label: "Không hoạt động" },
      ],
    },
  ],
};

export default function CatalogManager({ catalog }: { catalog: CatalogKey }) {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const isManager = hasRole("manager");
  const canManage = isAdmin || isManager;
  const canDelete = canManage;
  const showActions = canManage;

  const info = catalogInfo[catalog];
  const [records, setRecords] = useState<CatalogRecord[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);
  const [policyPage, setPolicyPage] = useState(1);
  const [policyTotal, setPolicyTotal] = useState(0);
  const [loadError, setLoadError] = useState("");
  const policyPageSize = 20;
  const policyPageCount = Math.max(1, Math.ceil(policyTotal / policyPageSize));
  const [editing, setEditing] = useState<CatalogRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const validation = useInlineValidation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusPendingId, setStatusPendingId] = useState<number | null>(null);
  const [statusError, setStatusError] = useState("");
  const statusBusy = useRef(false);

  const loadRecords = useCallback(async () => {
    setError("");
    setLoadError("");
    setLoading(true);
    try {
      if (catalog === "vehicle-types") {
        setRecords((await getVehicleTypes()).map(toVehicleTypeRecord));
      } else if (catalog === "policies") {
        const [policies, types] = await Promise.all([getRentalPolicies(policyPage, policyPageSize), getVehicleTypes()]);
        setVehicleTypes(types);
        setPolicyTotal(policies.totalCount);
        setRecords((policies.items ?? []).map((policy) => toPolicyRecord(policy, types)));
      } else {
        setRecords((await getSubscriptionPlans()).map(toPlanRecord));
      }
    } catch (loadError) {
      setLoadError("Không thể tải danh sách. Vui lòng thử lại.");
      if (catalog === "policies") setRecords([]);
      notifyApiError(loadError, `Không thể tải ${info.title.toLocaleLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [catalog, info.title, policyPage]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRecords(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRecords]);

  const openForm = (record?: CatalogRecord) => {
    setEditing(record ?? null);
    setValues(record ? { ...record.values } : Object.fromEntries(fieldsByCatalog[catalog].map((field) => [field.key, field.key === "isActive" ? "true" : ""])));
    setError("");
    validation.reset();
    setFormOpen(true);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const isEditing = Boolean(editing);
    try {
      if (catalog === "vehicle-types") {
        const body = { name: values.name.trim(), fuelType: values.fuelType, type: values.type };
        if (editing) await updateVehicleType(editing.id, body);
        else await createVehicleType(body);
      } else if (catalog === "policies") {
        await createRentalPolicy({
          name: values.name.trim(),
          vehicleTypeId: values.vehicleTypeId ? Number(values.vehicleTypeId) : null,
          vatRate: Number(values.vatRate),
          overtimeFeeRate: Number(values.overtimeFeeRate),
          depositPercentage: Number(values.depositPercentage),
          isActive: true,
        });
      } else {
        const body = {
          name: values.name.trim(),
          description: values.description.trim(),
          price: Number(values.price),
          durationDays: Number(values.durationDays),
          includedHours: values.includedHours ? Number(values.includedHours) : null,
          isActive: values.isActive ? values.isActive === "true" : (editing?.active ?? true),
        };
        if (editing) await updateSubscriptionPlan(editing.id, body);
        else await createSubscriptionPlan(body);
      }
      setFormOpen(false);
      notifySuccess(isEditing ? "Đã cập nhật thông tin." : "Đã thêm mới thành công.");
      if (catalog === "policies" && policyPage !== 1) setPolicyPage(1);
      else await loadRecords();
    } catch (saveError) {
      const message = validation.report(saveError);
      setError(message);
      notifyError(message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (record: CatalogRecord) => {
    if (!window.confirm(`Xóa "${record.values.name}"?`)) return;
    try {
      if (catalog === "vehicle-types") await deleteVehicleType(record.id);
      else if (catalog === "subscription-plans") await deleteSubscriptionPlan(record.id);
      else return;
      notifySuccess(`Đã xóa "${record.values.name}".`);
      await loadRecords();
    } catch (deleteError) {
      notifyApiError(deleteError, "Không thể xóa mục này.");
    }
  };

  const changePolicyStatus = async (record: CatalogRecord) => {
    if (!canManage || statusBusy.current) return;
    const nextActive = !record.active;
    const action = nextActive ? "Kích hoạt" : "Tạm ngưng";
    if (!window.confirm(`${action} chính sách "${record.values.name}"? Các đơn thuê đã tạo vẫn giữ nguyên điều khoản và giá.`)) return;
    statusBusy.current = true;
    setStatusPendingId(record.id);
    setStatusError("");
    try {
      const updated = await setRentalPolicyStatus(record.id, nextActive);
      setRecords((current) => current.map((item) => item.id === record.id ? toPolicyRecord(updated, vehicleTypes) : item));
      notifySuccess(nextActive ? "Đã kích hoạt chính sách thuê xe." : "Đã tạm ngưng chính sách thuê xe.");
    } catch (statusFailure) {
      const message = statusFailure instanceof Error ? statusFailure.message : "Không thể đổi trạng thái chính sách. Vui lòng thử lại.";
      setStatusError(message);
      notifyError(message);
    } finally {
      statusBusy.current = false;
      setStatusPendingId(null);
    }
  };

  const columns = catalog === "vehicle-types"
    ? [{ key: "name", label: "Loại xe" }, { key: "fuelType", label: "Nhiên liệu" }]
    : catalog === "policies"
      ? [{ key: "name", label: "Chính sách" }, { key: "vatRate", label: "VAT" }, { key: "overtimeFeeRate", label: "Phí trễ" }, { key: "depositPercentage", label: "Đặt cọc" }, { key: "vehicleType", label: "Loại xe" }, { key: "rentalCount", label: "Số lần thuê" }]
      : [{ key: "name", label: "Tên gói" }, { key: "includedHours", label: "Giờ bao gồm" }, { key: "durationDays", label: "Thời hạn" }, { key: "price", label: "Giá gói" }];

  return (
    <div className="space-y-6">
      <TransitFolio
        title={info.title}
        description={info.description}
      >
        <TransitFolioMetric
          label="Tổng số"
          value={loading ? <Skeleton className="h-8 w-16" /> : String(catalog === "policies" ? policyTotal : records.length)}
        />
        {canManage && (
          <button
            type="button"
            onClick={() => openForm()}
            disabled={catalog === "policies" && (loading || !!loadError)}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded bg-td-oxide px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-td-oxide-hover disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> {catalog === "policies" ? "Thêm chính sách" : "Thêm mới"}
          </button>
        )}
      </TransitFolio>
      {catalog === "policies" && <p className="max-w-3xl text-xs leading-relaxed text-td-muted">Mỗi chính sách là một phiên bản được giữ lại cho lịch sử thuê xe. Khi đổi điều khoản, hãy tạm ngưng chính sách đang hoạt động của loại xe trước khi tạo phiên bản mới. Các đơn thuê đã tạo giữ nguyên điều khoản và giá. Số lần thuê là tổng đơn đã gắn với từng chính sách, gồm mọi trạng thái.</p>}
      {loadError && <div className="flex flex-wrap items-center gap-3 text-sm"><p role="alert" className="text-danger">{loadError}</p><button type="button" onClick={() => void loadRecords()} className="font-semibold text-td-oxide underline">Thử lại</button></div>}
      {catalog === "policies" && statusError && <p role="alert" className="pl-3 text-sm text-danger">{statusError}</p>}
      {catalog === "policies" && statusPendingId !== null && <p role="status" className="sr-only">Đang cập nhật trạng thái chính sách...</p>}

      <AdminTableCard>
        <div className="border-b border-td-rule pb-2 pt-3">
          <h3 className="text-sm font-bold text-td-ink">Danh sách {info.title.toLocaleLowerCase()}</h3>
          <p className="mt-1 text-[11px] text-td-muted">{loading ? "Đang tải..." : `${catalog === "policies" ? policyTotal : records.length} mục`}</p>
        </div>
        <AdminTable aria-busy={loading} className="min-w-[680px]">
          <caption className="sr-only">Danh sách {info.title.toLocaleLowerCase()}</caption>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.key} scope="col" title={column.key === "rentalCount" ? "Tổng đơn có gắn chính sách này, gồm mọi trạng thái" : undefined}>{column.label}</th>)}
              <th scope="col">Trạng thái</th>
              {showActions && <th scope="col" data-actions>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? <AdminTableSkeleton columns={columns.length + (showActions ? 2 : 1)} /> : records.map((record) => (
              <tr key={record.id}>
                {columns.map((column) => (
                  <td key={column.key} className="text-td-ink">
                    {column.key === "rentalCount" ? (record.values.rentalCount === "" ? "—" : Number(record.values.rentalCount).toLocaleString("vi-VN"))
                      : column.key === "price" ? `${Number(record.values.price || 0).toLocaleString("vi-VN")} ₫`
                      : ["vatRate", "overtimeFeeRate", "depositPercentage"].includes(column.key) ? `${record.values[column.key] ?? "—"}%`
                        : column.key === "durationDays" ? `${record.values.durationDays ?? "—"} ngày`
                          : column.key === "includedHours" ? `${record.values.includedHours || "—"} giờ`
                            : record.values[column.key] || "—"}
                  </td>
                ))}
                <td><AdminStatusBadge domain="activity" status={record.active ? "active" : "inactive"}>{record.active ? "Đang hoạt động" : "Tạm ngưng"}</AdminStatusBadge></td>
                {showActions && (
                  <td data-actions>
                    <div className="flex justify-end gap-1">
                      {catalog === "policies" ? (
                        <AdminRowAction action={record.active ? "deactivate" : "activate"} label={`${record.active ? "Tạm ngưng" : "Kích hoạt"} ${record.values.name}`} disabled={statusPendingId !== null} isLoading={statusPendingId === record.id} onClick={() => void changePolicyStatus(record)} />
                      ) : <>
                        <AdminRowAction action="edit" label={`Sửa ${record.values.name}`} onClick={() => openForm(record)} />
                        {canDelete && <AdminRowAction action="delete" label={`Xóa ${record.values.name}`} onClick={() => void deleteRecord(record)} />}
                      </>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!loading && !loadError && records.length === 0 && <AdminTableEmptyRow colSpan={columns.length + (showActions ? 2 : 1)}>Không có dữ liệu.</AdminTableEmptyRow>}
          </tbody>
        </AdminTable>
        {catalog === "policies" && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-td-rule py-3 text-[11px] text-td-muted">
          <span>Trang {policyPage} / {policyPageCount} · {policyTotal} chính sách</span>
          <nav aria-label="Phân trang chính sách" className="flex items-center gap-2">
            <button type="button" aria-label="Trang chính sách trước" disabled={loading || policyPage <= 1} onClick={() => setPolicyPage((page) => page - 1)} className="rounded border border-td-rule p-1.5 text-td-ink disabled:opacity-40"><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
            <button type="button" aria-label="Trang chính sách sau" disabled={loading || policyPage >= policyPageCount} onClick={() => setPolicyPage((page) => page + 1)} className="rounded border border-td-rule p-1.5 text-td-ink disabled:opacity-40"><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
          </nav>
        </div>}
      </AdminTableCard>

      {formOpen && (
        <FormDialog title={`${editing ? "Chỉnh sửa" : "Thêm mới"} · ${info.title}`} onClose={() => setFormOpen(false)} busy={saving}>
            <ValidatedForm validation={validation} onSubmit={submitForm} validate={() => {
              if (catalog !== "policies") return {};
              const typeId = values.vehicleTypeId;
              if (typeId && !vehicleTypes.some((type) => String(type.id) === typeId)) return { vehicleTypeId: "Loại phương tiện không hợp lệ. Vui lòng chọn lại." };
              if (records.some((record) => record.active && record.values.vehicleTypeId === (typeId ?? ""))) return { vehicleTypeId: "Phạm vi loại xe này đã có chính sách đang hoạt động. Vui lòng tạm ngưng chính sách cũ trước khi thêm." };
              return {};
            }} className="space-y-4">
              {fieldsByCatalog[catalog].map((field) => (
                <label key={field.key} htmlFor={`catalog-${field.key}`} className="block">
                  <span className="mb-2 block text-sm font-semibold text-td-ink">{field.label}</span>
                  {field.type === "textarea" ? (
                    <InlineTextarea name={field.key} id={`catalog-${field.key}`} required={field.required} value={values[field.key] ?? ""} onChange={(event) => {
                      const value = event.currentTarget.value;
                      setValues((current) => ({ ...current, [field.key]: value }));
                    }} rows={4} className="admin-input resize-y" />
                  ) : field.type === "select" ? (
                    <InlineSelect name={field.key} id={`catalog-${field.key}`} required={field.required} value={values[field.key] ?? ""} onChange={(event) => {
                      const value = event.currentTarget.value;
                      setValues((current) => ({ ...current, [field.key]: value }));
                    }} className="admin-input">
                      <option value="" disabled={field.key !== "vehicleTypeId"}>{field.key === "vehicleTypeId" ? "Tất cả loại phương tiện" : `Chọn ${field.label.toLocaleLowerCase()}`}</option>
                      {(field.key === "vehicleTypeId" ? vehicleTypes.map((item) => ({ value: String(item.id), label: item.name ?? `Loại #${item.id}` })) : field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </InlineSelect>
                  ) : (
                    <InlineInput name={field.key} id={`catalog-${field.key}`} type={field.type ?? "text"} min={field.type === "number" ? "0" : undefined} max={field.max} step={field.type === "number" ? "any" : undefined} required={field.required} value={values[field.key] ?? ""} onChange={(event) => {
                      const value = event.currentTarget.value;
                      setValues((current) => ({ ...current, [field.key]: value }));
                    }} className="admin-input" />
                  )}
                </label>
              ))}
              {error && <p role="alert" className="text-sm text-danger">{error}</p>}
              <FormDialogFooter>
                <button type="button" disabled={saving} onClick={() => setFormOpen(false)} className="rounded border border-td-rule px-4 py-2.5 text-sm font-semibold text-td-ink hover:bg-td-paper disabled:opacity-60">Hủy</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded bg-td-oxide px-4 py-2.5 text-sm font-semibold text-white hover:bg-td-oxide-hover disabled:opacity-60"><Check className="h-4 w-4" />{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
              </FormDialogFooter>
            </ValidatedForm>
        </FormDialog>
      )}
    </div>
  );
}

function toVehicleTypeRecord(item: VehicleTypeDto): CatalogRecord {
  return { id: item.id, active: true, values: { name: item.name ?? "", fuelType: item.fuelType?.trim().toLowerCase() ?? "", type: item.type?.trim().toLowerCase() ?? "" } };
}

function toPolicyRecord(item: RentalPolicyDto, types: VehicleTypeDto[]): CatalogRecord {
  return {
    id: item.id,
    active: item.isActive,
    values: {
      name: item.name ?? "",
      vehicleTypeId: item.vehicleTypeId === null ? "" : String(item.vehicleTypeId),
      vehicleType: item.vehicleTypeId === null ? "Tất cả loại phương tiện" : types.find((type) => type.id === item.vehicleTypeId)?.name ?? "Chưa có thông tin loại phương tiện",
      vatRate: String(item.vatRate),
      overtimeFeeRate: String(item.overtimeFeeRate),
      depositPercentage: String(item.depositPercentage),
      rentalCount: typeof item.rentalCount === "number" && Number.isSafeInteger(item.rentalCount) && item.rentalCount >= 0 ? String(item.rentalCount) : "",
    },
  };
}

function toPlanRecord(item: SubscriptionPlanDto): CatalogRecord {
  return {
    id: item.id,
    active: item.isActive,
    values: {
      name: item.name ?? "",
      description: item.description ?? "",
      price: String(item.price),
      durationDays: String(item.durationDays),
      includedHours: item.includedHours === null ? "" : String(item.includedHours),
      isActive: String(item.isActive),
    },
  };
}
