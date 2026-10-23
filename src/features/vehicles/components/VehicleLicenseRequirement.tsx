import { IdCard } from "lucide-react";

type Props = {
  allowedLicenseTypes?: string[];
  detailed?: boolean;
  className?: string;
};

/** Show only the classes configured for this vehicle, without inferring a license hierarchy. */
export function VehicleLicenseRequirement({ allowedLicenseTypes = [], detailed = false, className = "" }: Props) {
  const classes = [...new Set(allowedLicenseTypes.map((type) => type.trim().toUpperCase()).filter(Boolean))];

  return (
    <span data-testid="vehicle-license-requirement" className={`flex min-w-0 items-start gap-2 text-xs leading-relaxed text-td-ink ${className}`}>
      <IdCard aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span className="min-w-0 break-words">
        <span className="font-semibold">
          {classes.length ? `Tự lái: GPLX ${classes.join(" hoặc ")}` : "Tự lái: đang cập nhật yêu cầu GPLX"}
        </span>
        {detailed && classes.length > 1 && (
          <span className="mt-1 block text-td-muted">Chỉ cần một trong các hạng bằng lái trên khi thuê tự lái.</span>
        )}
      </span>
    </span>
  );
}
