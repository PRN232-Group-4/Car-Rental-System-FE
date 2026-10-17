"use client";

interface ReportStatusChipsProps {
  currentStatus?: string;
  onSelectStatus: (status?: string) => void;
  counts: {
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
  };
}

export function ReportStatusChips({
  currentStatus,
  onSelectStatus,
  counts,
}: ReportStatusChipsProps) {
  const chips = [
    { id: undefined, label: "Tất cả", count: counts.total },
    { id: "new", label: "Mới tiếp nhận", count: counts.new, color: "text-warning" },
    { id: "in_progress", label: "Đang xử lý", count: counts.inProgress, color: "text-primary" },
    { id: "resolved", label: "Đã giải quyết", count: counts.resolved, color: "text-success" },
  ];

  return (
    <div
      role="group"
      aria-label="Lọc báo cáo theo trạng thái"
      className="flex flex-wrap items-center gap-2"
    >
      {chips.map((chip) => {
        const isSelected = currentStatus === chip.id;
        return (
          <button
            key={chip.label}
            type="button"
            onClick={() => onSelectStatus(chip.id)}
            aria-pressed={isSelected}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              isSelected
                ? "bg-primary text-white shadow-sm"
                : "border border-line bg-surface text-ink-2 hover:bg-canvas active:bg-sunken"
            }`}
          >
            <span>{chip.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 font-mono text-[11px] ${
                isSelected
                  ? "bg-white/20 text-white"
                  : "bg-sunken text-ink-3"
              }`}
            >
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
