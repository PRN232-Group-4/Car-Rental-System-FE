import type { ReactNode } from "react";

/**
 * Folio header dùng chung cho các trang Transit Desk (Ca trực, Đội xe, Vận hành,
 * Điều phối, Chăm sóc & Sự cố, Chính sách, Tổ chức, Cá nhân).
 * Markup giữ đúng ngôn ngữ thị giác của các trang Phase 4: số chương + tag mono,
 * kicker viết hoa, tiêu đề có nhấn chữ nghiêng, và vùng số liệu/hành động bên phải.
 */
export function TransitFolio({
  index,
  tag,
  kicker,
  title,
  description,
  children,
}: {
  index: string;
  tag: string;
  kicker: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-6 border-b border-td-rule pb-6 lg:flex-row lg:items-end">
      <div className="flex items-start gap-5">
        <span className="min-w-[42px] border-t-2 border-td-oxide pt-1 font-mono text-xs font-bold text-td-oxide">
          {index}
          <br />
          {tag}
        </span>
        <div>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-td-muted">
            {kicker}
          </span>
          <h1 className="mt-1 font-sans text-3xl font-bold tracking-tight text-td-ink sm:text-4xl md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-td-muted sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-4 self-start lg:self-end">
          {children}
        </div>
      )}
    </div>
  );
}

/** Khối số liệu bên phải folio: nhãn mono nhỏ + giá trị lớn. */
export function TransitFolioMetric({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="border-l border-td-rule pl-4 text-right">
      <span className="block font-mono text-[10px] tracking-wider text-td-muted">
        {label}
      </span>
      <strong className="block font-sans text-3xl font-bold tracking-tight text-td-ink">
        {value}
      </strong>
    </div>
  );
}

export default TransitFolio;
