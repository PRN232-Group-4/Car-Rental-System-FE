"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Pencil, Plus, ReceiptText, Tags, Trash2, WalletCards } from "lucide-react";
import {
  createRentalPolicy,
  createSubscriptionPlan,
  createVehicleType,
  deleteSubscriptionPlan,
  deleteVehicleType,
  getRentalPolicies,
  getSubscriptionPlans,
  getVehicleTypes,
  updateSubscriptionPlan,
  updateVehicleType,
} from "./api";
import type { RentalPolicyDto, SubscriptionPlanDto, VehicleTypeDto } from "./api";
import { useAuth } from "@/features/auth";
import { notifyApiError, notifySuccess } from "@/components/ui/Toaster";
import { InlineInput, InlineSelect, InlineTextarea, ValidatedForm, useInlineValidation } from "@/components/forms/inline-validation";
import FormDialog from "@/components/ui/FormDialog";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";

type CatalogKey = "vehicle-types" | "policies" | "subscription-plans";
type CatalogRecord = { id: number; values: Record<string, string>; active: boolean };
type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  required?: boolean;
  options?: { value: string; label: string }[];
};

const catalogInfo: Record<CatalogKey, { title: string; description: string; icon: typeof Tags }> = {
  "vehicle-types": {
    title: "Loại phương tiện",
    description: "Quản lý loại phương tiện và nhiên liệu mặc định.",
    icon: Tags,
  },
  policies: {
    title: "Chính sách thuê xe",
    description: "Cấu hình VAT, phí trễ giờ và đặt cọc cho từng loại phương tiện.",
    icon: ReceiptText,
  },
  "subscription-plans": {
    title: "Gói đăng ký",
    description: "Quản lý gói thuê bao, thời hạn, số giờ sử dụng và quyền lợi.",
    icon: WalletCards,
  },
};

const fieldsByCatalog: Record<CatalogKey, Field[]> = {
  "vehicle-types": [
    { key: "name", label: "Tên loại phương tiện", required: true },
    { key: "type", label: "Nhóm xe", type: "select", required: true, options: [{ value: "car", label: "Ô tô" }, { value: "motorbike", label: "Xe máy" }] },
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
    { key: "vehicleTypeId", label: "Loại phương tiện", type: "select", required: true },
    { key: "vatRate", label: "Thuế VAT (%)", type: "number", required: true },
    { key: "overtimeFeeRate", label: "Phí trễ giờ (%)", type: "number", required: true },
    { key: "depositPercentage", label: "Tỷ lệ đặt cọc (%)", type: "number", required: true },
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
  const canDelete = isAdmin;

  const info = catalogInfo[catalog];
  const Icon = info.icon;
  const [records, setRecords] = useState<CatalogRecord[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeDto[]>([]);
  const [editing, setEditing] = useState<CatalogRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const validation = useInlineValidation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<CatalogRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRecords = useCallback(async () => {
    setError("");
    try {
      if (catalog === "vehicle-types") {
        setRecords((await getVehicleTypes()).map(toVehicleTypeRecord));
      } else if (catalog === "policies") {
        const [policies, types] = await Promise.all([getRentalPolicies(), getVehicleTypes()]);
        setVehicleTypes(types);
        setRecords(policies.map((policy) => toPolicyRecord(policy, types)));
      } else {
        setRecords((await getSubscriptionPlans()).map(toPlanRecord));
      }
    } catch (loadError) {
      notifyApiError(loadError, `Không thể tải ${info.title.toLocaleLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [catalog, info.title]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRecords(), 0);
    return () => window.clearTimeout(timer);
  }, [loadRecords]);

  const openForm = useCallback((record?: CatalogRecord) => {
    setEditing(record ?? null);
    setValues(record ? { ...record.values } : Object.fromEntries(fieldsByCatalog[catalog].map((field) => [field.key, field.key === "isActive" ? "true" : ""])));
    setError("");
    validation.reset();
    setFormOpen(true);
  }, [catalog, validation]);

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
          vehicleTypeId: Number(values.vehicleTypeId),
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
      await loadRecords();
    } catch (saveError) {
      setError(validation.report(saveError));
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = (record: CatalogRecord) => {
    setRecordToDelete(record);
  };

  const executeDeleteRecord = async (record: CatalogRecord) => {
    setDeleting(true);
    try {
      if (catalog === "vehicle-types") await deleteVehicleType(record.id);
      else if (catalog === "subscription-plans") await deleteSubscriptionPlan(record.id);
      else return;
      notifySuccess(`Đã xóa "${record.values.name}".`);
      setRecordToDelete(null);
      await loadRecords();
    } catch (deleteError) {
      notifyApiError(deleteError, "Không thể xóa mục này.");
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      catalog === "vehicle-types"
        ? [{ key: "name", label: "Loại xe" }, { key: "fuelType", label: "Nhiên liệu" }]
        : catalog === "policies"
          ? [
              { key: "name", label: "Chính sách" },
              { key: "vatRate", label: "VAT" },
              { key: "overtimeFeeRate", label: "Phí trễ" },
              { key: "depositPercentage", label: "Đặt cọc" },
              { key: "vehicleType", label: "Loại xe" },
            ]
          : [
              { key: "name", label: "Tên gói" },
              { key: "includedHours", label: "Giờ bao gồm" },
              { key: "durationDays", label: "Thời hạn" },
              { key: "price", label: "Giá gói" },
            ],
    [catalog],
  );

  const tableColumns = useMemo<ColumnDef<CatalogRecord>[]>(() => {
    const cols: ColumnDef<CatalogRecord>[] = columns.map((col) => ({
      id: col.key,
      header: col.label,
      cell: ({ row }) => {
        const record = row.original;
        if (col.key === "price") {
          return (
            <span className="font-mono tabular-nums text-ink">
              {Number(record.values.price || 0).toLocaleString("vi-VN")} ₫
            </span>
          );
        }
        if (["vatRate", "overtimeFeeRate", "depositPercentage"].includes(col.key)) {
          return (
            <span className="font-mono tabular-nums text-ink">
              {record.values[col.key] ?? "—"}%
            </span>
          );
        }
        if (col.key === "durationDays") {
          return (
            <span className="font-mono tabular-nums text-ink">
              {record.values.durationDays ?? "—"} ngày
            </span>
          );
        }
        if (col.key === "includedHours") {
          return (
            <span className="font-mono tabular-nums text-ink">
              {record.values.includedHours || "—"} giờ
            </span>
          );
        }
        return <span className="text-ink">{record.values[col.key] || "—"}</span>;
      },
    }));

    cols.push({
      id: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <StatusBadge status={row.original.active ? "active" : "inactive"} />
      ),
    });

    if (canManage) {
      cols.push({
        id: "actions",
        header: () => <span className="block text-right">Thao tác</span>,
        cell: ({ row }) => {
          const record = row.original;
          return (
            <div className="flex justify-end gap-1">
              {catalog !== "policies" && (
                <button
                  type="button"
                  onClick={() => openForm(record)}
                  aria-label={`Sửa ${record.values.name}`}
                  className="rounded-lg p-2 text-ink-3 transition hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
              {canDelete && catalog !== "policies" && (
                <button
                  type="button"
                  onClick={() => deleteRecord(record)}
                  disabled={deleting}
                  aria-label={`Xóa ${record.values.name}`}
                  className="rounded-lg p-2 text-ink-3 transition hover:bg-danger-bg hover:text-danger disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        },
      });
    }

    return cols;
  }, [canDelete, canManage, catalog, columns, deleting, openForm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-6 w-6" /></span>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{info.title}</h2>
          </div>
        </div>
        {canManage && catalog !== "policies" && (
          <button type="button" onClick={() => openForm()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-e1 transition hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> Thêm mới
          </button>
        )}
        {canManage && catalog === "policies" && (
          <button type="button" onClick={() => openForm()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-e1 transition hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> Thêm chính sách
          </button>
        )}
      </div>
      <p className="text-sm text-ink-3">{info.description}</p>
      {catalog === "policies" && <p className="rounded-xl border border-primary/30 bg-primary-tint px-4 py-3 text-sm text-warning">API hiện chỉ hỗ trợ xem và tạo chính sách; chưa có cập nhật hoặc xóa.</p>}

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-e1">
        <div className="border-b border-line px-5 py-4">
          <h3 className="font-bold text-ink">Danh sách {info.title.toLocaleLowerCase()}</h3>
          <p className="mt-1 text-xs text-ink-3">{loading ? "Đang tải..." : `${records.length} mục`}</p>
        </div>
        <DataTable
          columns={tableColumns}
          data={records}
          caption={`Danh sách ${info.title.toLocaleLowerCase()}`}
          loading={loading}
          emptyTitle="Không có dữ liệu."
          className="border-0 rounded-none shadow-none"
        />
      </div>

      <ConfirmDialog
        open={recordToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRecordToDelete(null);
        }}
        title={`Xác nhận xóa ${info.title.toLocaleLowerCase()}`}
        description={`Bạn có chắc chắn muốn xóa "${recordToDelete?.values.name}"? Thao tác này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        isPending={deleting}
        onConfirm={async () => {
          if (recordToDelete) await executeDeleteRecord(recordToDelete);
        }}
      />

      {formOpen && (
        <FormDialog title={`${editing ? "Chỉnh sửa" : "Thêm mới"} · ${info.title}`} onClose={() => setFormOpen(false)} busy={saving}>
            <ValidatedForm validation={validation} onSubmit={submitForm} className="space-y-4">
              {fieldsByCatalog[catalog].map((field) => (
                <label key={field.key} htmlFor={`catalog-${field.key}`} className="block">
                  <span className="mb-2 block text-sm font-semibold text-ink">{field.label}</span>
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
                      <option value="" disabled>Chọn {field.label.toLocaleLowerCase()}</option>
                      {(field.key === "vehicleTypeId" ? vehicleTypes.map((item) => ({ value: String(item.id), label: item.name ?? `Loại #${item.id}` })) : field.options ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </InlineSelect>
                  ) : (
                    <InlineInput name={field.key} id={`catalog-${field.key}`} type={field.type ?? "text"} min={field.type === "number" ? "0" : undefined} step={field.type === "number" ? "any" : undefined} required={field.required} value={values[field.key] ?? ""} onChange={(event) => {
                      const value = event.currentTarget.value;
                      setValues((current) => ({ ...current, [field.key]: value }));
                    }} className="admin-input" />
                  )}
                </label>
              ))}
              {error && <p role="alert" className="text-sm text-danger">{error}</p>}
              <div className="flex justify-end gap-3 border-t border-line pt-4">
                <button type="button" disabled={saving} onClick={() => setFormOpen(false)} className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-canvas disabled:opacity-60">Hủy</button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"><Check className="h-4 w-4" />{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
              </div>
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
      vehicleType: types.find((type) => type.id === item.vehicleTypeId)?.name ?? "—",
      vatRate: String(item.vatRate),
      overtimeFeeRate: String(item.overtimeFeeRate),
      depositPercentage: String(item.depositPercentage),
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
