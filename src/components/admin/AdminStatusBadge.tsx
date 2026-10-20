import type { ReactNode } from "react";
import { getAdminStatusTone } from "./status-rules";
import type { AdminStatusDomain } from "./status-rules";

/**
 * Trạng thái kiểu Transit Desk: glyph hình học + nhãn mono, không dùng pill màu.
 * Màu sắc lấy từ status-rules.ts để mọi trang admin đọc trạng thái giống nhau.
 */
const toneClass = {
  success: "text-td-ink font-semibold",
  info: "text-td-ink font-semibold",
  warning: "text-td-oxide font-bold",
  danger: "text-td-oxide font-bold",
  neutral: "text-td-muted",
} as const;

function ToneGlyph({ tone }: { tone: keyof typeof toneClass }) {
  if (tone === "success" || tone === "info") {
    return (
      <span
        aria-hidden="true"
        className={`inline-block h-2 w-2 rotate-45 border border-td-ink ${tone === "success" ? "bg-td-teal" : "bg-td-ink"}`}
      />
    );
  }
  if (tone === "warning") {
    return <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-td-oxide" />;
  }
  if (tone === "danger") {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 rotate-45 border border-td-oxide bg-td-oxide"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="inline-block h-1.5 w-1.5 rounded-full border border-td-muted"
    />
  );
}

export function AdminStatusBadge({
  domain,
  status,
  children,
}: {
  domain: AdminStatusDomain;
  status: string | null | undefined;
  children: ReactNode;
}) {
  const tone = getAdminStatusTone(domain, status);
  return (
    <span
      data-status-tone={tone}
      className={`inline-flex w-fit items-center gap-2 whitespace-nowrap font-mono text-[11px] uppercase tracking-wide ${toneClass[tone]}`}
    >
      <ToneGlyph tone={tone} />
      {children}
    </span>
  );
}
