"use client";

import React, { type ReactNode } from "react";
import { getAdminStatusTone, type AdminStatusDomain, type AdminStatusTone } from "@/components/admin/status-rules";

export interface TransitDeskStatusProps {
  domain: AdminStatusDomain;
  status: string | null | undefined;
  metaText?: string;
  children: ReactNode;
  className?: string;
}

export function TransitDeskStatus({
  domain,
  status,
  metaText,
  children,
  className = "",
}: TransitDeskStatusProps) {
  const tone: AdminStatusTone = getAdminStatusTone(domain, status);

  // Semantic glyph per tone
  const renderGlyph = () => {
    switch (tone) {
      case "success":
        return (
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rotate-45 border border-td-ink bg-td-teal"
          />
        );
      case "warning":
      case "danger":
        return (
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-td-oxide"
          />
        );
      case "info":
        return (
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-1 border-l border-r border-td-ink"
          />
        );
      case "neutral":
      default:
        return (
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full border border-td-muted bg-transparent"
          />
        );
    }
  };

  const getToneClass = () => {
    if (tone === "danger" || tone === "warning") {
      return "text-td-oxide font-bold";
    }
    if (tone === "success") {
      return "text-td-ink font-semibold";
    }
    return "text-td-muted";
  };

  return (
    <span
      data-status-tone={tone}
      className={`inline-flex items-center gap-2 font-mono text-xs tracking-wide uppercase ${getToneClass()} ${className}`}
    >
      {renderGlyph()}
      <span>{children}</span>
      {metaText && (
        <span className="font-normal text-td-muted lowercase tracking-normal">
          · {metaText}
        </span>
      )}
    </span>
  );
}

export default TransitDeskStatus;
