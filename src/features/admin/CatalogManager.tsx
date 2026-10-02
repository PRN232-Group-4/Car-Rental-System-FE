"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Check,
  Pencil,
  Plus,
  ReceiptText,
  Tags,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { MOCK_SUBSCRIPTION_PLANS } from "@/api/mock/mock-catalog";
import type { SubscriptionPlanCatalogItem } from "@/api/mock/mock-catalog";

type CatalogKey = "vehicle-types" | "policies" | "subscription-plans";
type CatalogRecord = {
  id: string;
  values: Record<string, string>;
  active: boolean;
};
type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea";
  options?: { value: string; label: string }[];
  suffix?: string;
  required?: boolean;
};
type CatalogConfig = {
  title: string;
  description: string;
  storageKey: string;
  icon: typeof Tags;
  columns: FieldConfig[];
  fields: FieldConfig[];
  seed: CatalogRecord[];
};

const fromPlan = (plan: SubscriptionPlanCatalogItem): CatalogRecord => ({
  id: plan.id,
  active: true,
  values: {
    name: plan.name,
    hours: String(plan.hours),
    validityDays: String(plan.validityDays),
    price: String(plan.price),
    features: plan.features.join("\n"),
  },
});

const configs: Record<CatalogKey, CatalogConfig> = {
  "vehicle-types": {
    title: "Loại phương tiện",
    description:
      "Quản lý danh mục loại phương tiện và thông tin nhiên liệu mặc định.",
    storageKey: "thong-dong-admin-vehicle-types",
    icon: Tags,
    columns: [
      { key: "name", label: "Tên loại xe" },
      { key: "fuelType", label: "Nhiên liệu" },
      { key: "description", label: "Mô tả" },
    ],
    fields: [
      { key: "name", label: "Tên loại xe", required: true },
      {
        key: "fuelType",
        label: "Nhiên liệu mặc định",
        type: "select",
        required: true,
        options: [
          { value: "Gasoline", label: "Xăng" },
          { value: "Diesel", label: "Dầu diesel" },
          { value: "Electric", label: "Điện" },
          { value: "Gasoline / Electric", label: "Xăng / Điện" },
        ],
      },
      { key: "description", label: "Mô tả", type: "textarea" },
    ],
    seed: [
      {
        id: "vt-car",
        active: true,
        values: {
          name: "Car",
          fuelType: "Gasoline",
          description: "Ô tô động cơ đốt trong",
        },
      },
      {
        id: "vt-electric-car",
        active: true,
        values: {
          name: "Electric Car",
          fuelType: "Electric",
          description: "Ô tô chạy bằng điện",
        },
      },
      {
        id: "vt-motorbike",
        active: true,
        values: {
          name: "Motorbike",
          fuelType: "Gasoline",
          description: "Xe máy động cơ đốt trong",
        },
      },
      {
        id: "vt-electric-motorbike",
        active: true,
        values: {
          name: "Electric Motorbike",
          fuelType: "Electric",
          description: "Xe máy chạy bằng điện",
        },
      },
    ],
  },
  policies: {
    title: "Chính sách thuê xe",
    description:
      "Cấu hình thuế VAT, phí trễ giờ và tỷ lệ đặt cọc theo loại xe.",
    storageKey: "thong-dong-admin-rental-policies",
    icon: ReceiptText,
    columns: [
      { key: "name", label: "Chính sách" },
      { key: "vatRate", label: "VAT (%)" },
      { key: "overtimeFeeRate", label: "Phí trễ (%)" },
      { key: "depositPercentage", label: "Đặt cọc (%)" },
    ],
    fields: [
      { key: "name", label: "Tên chính sách", required: true },
      {
        key: "vehicleType",
        label: "Loại phương tiện",
        type: "select",
        required: true,
        options: [
          { value: "Car", label: "Ô tô xăng" },
          { value: "Electric Car", label: "Ô tô điện" },
          { value: "Motorbike", label: "Xe máy xăng" },
          { value: "Electric Motorbike", label: "Xe máy điện" },
        ],
      },
      {
        key: "vatRate",
        label: "Thuế VAT",
        type: "number",
        suffix: "%",
        required: true,
      },
      {
        key: "overtimeFeeRate",
        label: "Phí trễ giờ",
        type: "number",
        suffix: "%",
        required: true,
      },
      {
        key: "depositPercentage",
        label: "Tỷ lệ đặt cọc",
        type: "number",
        suffix: "%",
        required: true,
      },
    ],
    seed: [
      {
        id: "policy-car",
        active: true,
        values: {
          name: "Chính sách ô tô xăng",
          vehicleType: "Car",
          vatRate: "10",
          overtimeFeeRate: "150",
          depositPercentage: "10",
        },
      },
      {
        id: "policy-electric-car",
        active: true,
        values: {
          name: "Chính sách ô tô điện",
          vehicleType: "Electric Car",
          vatRate: "10",
          overtimeFeeRate: "150",
          depositPercentage: "10",
        },
      },
      {
        id: "policy-motorbike",
        active: true,
        values: {
          name: "Chính sách xe máy xăng",
          vehicleType: "Motorbike",
          vatRate: "10",
          overtimeFeeRate: "120",
          depositPercentage: "10",
        },
      },
      {
        id: "policy-electric-motorbike",
        active: true,
        values: {
          name: "Chính sách xe máy điện",
          vehicleType: "Electric Motorbike",
          vatRate: "10",
          overtimeFeeRate: "120",
          depositPercentage: "10",
        },
      },
    ],
  },
  "subscription-plans": {
    title: "Gói Đăng Ký",
    description: "Quản lý gói thuê bao, thời hạn, số giờ sử dụng và quyền lợi.",
    storageKey: "thong-dong-admin-subscription-plans",
    icon: WalletCards,
    columns: [
      { key: "name", label: "Tên gói" },
      { key: "hours", label: "Số giờ" },
      { key: "validityDays", label: "Thời hạn (ngày)" },
      { key: "price", label: "Giá gói (₫)" },
    ],
    fields: [
      { key: "name", label: "Tên gói thuê bao", required: true },
      {
        key: "hours",
        label: "Số giờ sử dụng",
        type: "number",
        suffix: "giờ",
        required: true,
      },
      {
        key: "validityDays",
        label: "Thời hạn",
        type: "number",
        suffix: "ngày",
        required: true,
      },
      {
        key: "price",
        label: "Giá gói",
        type: "number",
        suffix: "₫",
        required: true,
      },
      {
        key: "features",
        label: "Quyền lợi (mỗi dòng một mục)",
        type: "textarea",
      },
    ],
    seed: MOCK_SUBSCRIPTION_PLANS.map(fromPlan),
  },
};

export default function CatalogManager({ catalog }: { catalog: CatalogKey }) {
  const config = configs[catalog];
  const Icon = config.icon;
  const [records, setRecords] = useState(config.seed);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState<CatalogRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(config.storageKey);
        if (saved !== null) {
          const parsed: unknown = JSON.parse(saved);
          if (!isCatalogRecordList(parsed))
            throw new Error("Dữ liệu danh mục đã lưu không hợp lệ.");
          setRecords(parsed);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải dữ liệu danh mục.",
        );
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [config.storageKey]);

  const openForm = (record?: CatalogRecord) => {
    setEditing(record ?? null);
    setFormOpen(true);
    setFormValues(
      record
        ? { ...record.values }
        : Object.fromEntries(config.fields.map((field) => [field.key, ""])),
    );
    setError("");
  };

  const persist = (updated: CatalogRecord[]) => {
    try {
      window.localStorage.setItem(config.storageKey, JSON.stringify(updated));
      setRecords(updated);
      setError("");
      return true;
    } catch {
      setError("Không thể lưu dữ liệu vào bộ nhớ trình duyệt.");
      return false;
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = formValues.name?.trim().toLocaleLowerCase();
    if (
      records.some(
        (record) =>
          record.values.name?.trim().toLocaleLowerCase() === name &&
          record.id !== editing?.id,
      )
    ) {
      setError("Tên này đã tồn tại trong danh mục.");
      return;
    }
    const nextRecord: CatalogRecord = {
      id: editing?.id ?? `${catalog}-${Date.now()}`,
      active: editing?.active ?? true,
      values: Object.fromEntries(
        Object.entries(formValues).map(([key, value]) => [key, value.trim()]),
      ),
    };
    const updated = editing
      ? records.map((record) =>
          record.id === editing.id ? nextRecord : record,
        )
      : [nextRecord, ...records];
    if (persist(updated)) setFormOpen(false);
  };

  const deleteRecord = (record: CatalogRecord) => {
    if (!window.confirm(`Xóa "${record.values.name}" khỏi danh mục?`)) return;
    persist(records.filter((item) => item.id !== record.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Cấu hình hệ thống
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {config.title}
            </h2>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openForm()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:bg-emerald-800"
        >
          <Plus className="h-4 w-4" /> Thêm mới
        </button>
      </div>
      <p className="text-sm text-slate-500">{config.description}</p>
      <div
        role="status"
        className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900"
      >
        Dữ liệu mẫu được lưu trong bộ nhớ trình duyệt này; kết nối API quản trị
        để đồng bộ lên hệ thống.
      </div>
      {error && !editing && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="font-bold text-slate-900">
            Danh sách {config.title.toLocaleLowerCase()}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {records.length} mục {ready ? "" : "· Đang tải..."}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.key} className="px-5 py-3">
                    {column.label}
                  </th>
                ))}
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => (
                <tr key={record.id} className="text-sm hover:bg-slate-50/60">
                  {config.columns.map((column) => (
                    <td
                      key={column.key}
                      className="max-w-[300px] px-5 py-4 text-slate-700"
                    >
                      {column.key === "price"
                        ? `${Number(record.values[column.key] || 0).toLocaleString("vi-VN")} ₫`
                        : column.suffix
                          ? `${record.values[column.key] ?? "—"} ${column.suffix}`
                          : column.key === "features"
                            ? `${(record.values[column.key] ?? "").split("\n").filter(Boolean).length} quyền lợi`
                            : record.values[column.key] || "—"}
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${record.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {record.active ? "Đang hoạt động" : "Tạm ngưng"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openForm(record)}
                        aria-label={`Sửa ${record.values.name}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRecord(record)}
                        aria-label={`Xóa ${record.values.name}`}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ready && records.length === 0 && (
                <tr>
                  <td
                    colSpan={config.columns.length + 2}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Danh mục chưa có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFormOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-dialog-title"
            className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <h3
                id="catalog-dialog-title"
                className="font-bold text-slate-900"
              >
                {editing ? "Chỉnh sửa" : "Thêm mới"} · {config.title}
              </h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                aria-label="Đóng biểu mẫu"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={submitForm} className="space-y-4 p-5 sm:p-6">
              {config.fields.map((field) => (
                <label
                  key={field.key}
                  htmlFor={`catalog-${field.key}`}
                  className="block"
                >
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    {field.label}
                  </span>
                  {field.type === "textarea" ? (
                    <textarea
                      id={`catalog-${field.key}`}
                      name={field.key}
                      required={field.required}
                      value={formValues[field.key] ?? ""}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: event.currentTarget.value,
                        }))
                      }
                      rows={4}
                      className="admin-input resize-y"
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={`catalog-${field.key}`}
                      name={field.key}
                      required={field.required}
                      value={formValues[field.key] ?? ""}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: event.currentTarget.value,
                        }))
                      }
                      className="admin-input"
                    >
                      <option value="" disabled>
                        Chọn {field.label.toLocaleLowerCase()}
                      </option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`catalog-${field.key}`}
                      name={field.key}
                      type={field.type ?? "text"}
                      min={field.type === "number" ? "0" : undefined}
                      step={field.type === "number" ? "any" : undefined}
                      required={field.required}
                      value={formValues[field.key] ?? ""}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          [field.key]: event.currentTarget.value,
                        }))
                      }
                      className="admin-input"
                    />
                  )}
                </label>
              ))}
              {error && (
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  <Check className="h-4 w-4" />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function isCatalogRecordList(value: unknown): value is CatalogRecord[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.active === "boolean" &&
        typeof item.values === "object" &&
        item.values !== null &&
        Object.values(item.values).every(
          (fieldValue) => typeof fieldValue === "string",
        ),
    )
  );
}
