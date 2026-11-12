import type { ReactNode } from "react";

/**
 * Page header shared by the Transit Desk shells (admin, customer desk, driver portal).
 * The heading carries the page on its own: no kicker, no chapter number, no accent split.
 * The right slot holds at most one quiet figure and/or one labelled primary action.
 */
export function TransitFolio({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-td-rule pb-5 lg:flex-row lg:items-end">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-td-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-td-muted">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-4 self-start lg:self-end">
          {children}
        </div>
      )}
    </div>
  );
}

/** One figure beside the folio title: plain label, tabular value, same weight as body data. */
export function TransitFolioMetric({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="text-right">
      <span className="block text-xs text-td-muted">{label}</span>
      <strong className="block text-xl font-semibold tabular-nums text-td-ink">{value}</strong>
    </div>
  );
}

export default TransitFolio;
