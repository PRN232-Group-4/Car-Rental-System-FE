import { InlineError } from "@/components/forms/inline-validation";

// Includes the classes already used by customer profiles and legacy records.
const LICENSE_CLASSES = ["A1", "A2", "A3", "A4", "A", "B1", "B2", "B", "C1", "C", "D1", "D2", "D", "E", "F", "BE", "C1E", "CE", "D1E", "D2E", "DE", "FB2", "FC", "FD", "FE"];

export function parseAllowedLicenseTypes(value: string): string[] {
  return [...new Set(value.split(",").map((type) => type.trim().toUpperCase()).filter(Boolean))];
}

export default function VehicleLicenseConfig({ value, onChange, disabled, error }: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const selected = parseAllowedLicenseTypes(value);
  const additionalValue = value.split(",").filter((type) => !LICENSE_CLASSES.includes(type.trim().toUpperCase())).join(",").trimStart();
  const unconfigured = selected.length === 0;
  const describedBy = ["allowed-license-types-help", error ? "allowedLicenseTypes-error" : ""].filter(Boolean).join(" ");

  function toggle(type: string, checked: boolean) {
    onChange((checked ? [...selected, type] : selected.filter((item) => item !== type)).join(", "));
  }

  return (
    <fieldset disabled={disabled} aria-describedby={describedBy} className="min-w-0 space-y-4">
      <legend className="text-sm font-semibold text-td-ink">Hạng bằng lái được phép thuê</legend>
      <p id="allowed-license-types-help" className="text-xs leading-relaxed text-td-muted">Chọn từng hạng bằng được chấp nhận cho xe này. Khách tự lái cần có ít nhất một bằng đúng hạng đã duyệt và còn hạn đến hết chuyến; các hạng không tự quy đổi tương đương.</p>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 border-b border-td-rule pb-4 text-sm text-td-ink">
        <input id="allowedLicenseTypes" name="allowedLicenseTypes" type="checkbox" checked={unconfigured} onChange={() => onChange("")} aria-invalid={!!error} aria-describedby={describedBy} className="mt-0.5 h-4 w-4 shrink-0 accent-td-oxide" />
        <span><span className="block font-semibold">Chưa cấu hình hạng bằng</span><span className="mt-1 block text-xs text-td-muted">Xe chưa hiển thị trong danh sách cho khách. Chọn ít nhất một hạng bên dưới để hoàn tất cấu hình.</span></span>
      </label>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {LICENSE_CLASSES.map((type) => (
          <label key={type} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded border px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-td-oxide ${selected.includes(type) ? "border-td-oxide bg-td-chalk text-td-oxide" : "border-td-rule text-td-ink hover:bg-td-chalk"}`}>
            <input name="allowedLicenseTypes" type="checkbox" value={type} checked={selected.includes(type)} onChange={(event) => toggle(type, event.currentTarget.checked)} aria-label={`Chấp nhận hạng ${type}`} aria-invalid={!!error} aria-describedby={describedBy} className="h-4 w-4 shrink-0 accent-td-oxide" />
            <span className="font-mono font-semibold">{type}</span>
          </label>
        ))}
      </div>
      <div>
        <label htmlFor="additionalLicenseTypes" className="text-xs font-semibold text-td-muted">Hạng khác trong hồ sơ (nếu có)</label>
        <input id="additionalLicenseTypes" name="allowedLicenseTypes" value={additionalValue} onChange={(event) => onChange([...selected.filter((type) => LICENSE_CLASSES.includes(type)), event.currentTarget.value].filter(Boolean).join(", "))} aria-invalid={!!error} aria-describedby={["additional-license-types-help", error ? "allowedLicenseTypes-error" : ""].filter(Boolean).join(" ")} placeholder="Nhập hạng khác, cách nhau bằng dấu phẩy" className={`admin-input mt-2 ${error ? "!border-danger ring-1 ring-danger" : ""}`} />
        <p id="additional-license-types-help" className="mt-2 text-xs text-td-muted">Giữ nguyên các hạng riêng đang dùng trong hồ sơ. Mỗi hạng gồm 1–20 chữ cái hoặc chữ số.</p>
        <InlineError name="allowedLicenseTypes" inputId="allowedLicenseTypes" />
      </div>
      <div className="border-t border-td-rule pt-4">
        <h3 className="text-sm font-bold text-td-ink">Bằng lái được chấp nhận</h3>
        <p role="status" className="mt-2 text-sm text-td-ink">{unconfigured ? "Chưa chọn hạng bằng. Xe đang ẩn khỏi danh sách cho khách." : `Đã chọn ${selected.length} hạng bằng. Khách chỉ cần có một trong các hạng dưới đây.`}</p>
        {unconfigured ? (
          <div className="mt-3 border-t border-td-rule pt-3">
            <div><p className="text-sm font-semibold text-td-ink">Cần cấu hình hạng bằng lái</p><p className="mt-1 text-xs text-td-muted">Quản trị viên vẫn có thể xem và chỉnh sửa xe. Chọn hạng bằng được chấp nhận rồi lưu thay đổi.</p></div>
          </div>
        ) : (
          <ul aria-label="Các hạng bằng đã chọn" className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-td-rule pt-3 text-sm">
            {selected.map((type) => <li key={type} className="min-w-0 break-words"><span className="font-mono font-semibold text-td-ink">Hạng {type}</span> <span className="text-xs text-td-muted">được phép thuê xe này</span></li>)}
          </ul>
        )}
      </div>
    </fieldset>
  );
}
