"use client";

import React, { type ReactNode, useEffect, useRef, useState } from "react";
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
  const prevStatusRef = useRef(status);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (prevStatusRef.current !== undefined && prevStatusRef.current !== status) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 450);
      prevStatusRef.current = status;
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = status;
  }, [status]);

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
      data-status-flashing={isFlashing ? "true" : undefined}
      className={`inline-flex items-center gap-2 font-mono text-xs tracking-wide uppercase transition-all duration-300 ${
        isFlashing ? "scale-105 rounded px-1 -mx-1" : ""
      } ${getToneClass()} ${className}`}
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
