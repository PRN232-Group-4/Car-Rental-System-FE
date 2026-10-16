"use client";

import React, { type ComponentPropsWithoutRef } from "react";
import { Loader2 } from "lucide-react";
import Link from "@/components/navigation/NavigationLink";
import { rowActionRules, type AdminRowActionKind } from "./row-action-rules";

type ActionProps = {
  action: AdminRowActionKind;
  /** Include the record's name when available; used by screen readers and the native tooltip. */
  label: string;
};

type ButtonProps = ActionProps & Omit<ComponentPropsWithoutRef<"button">, "children" | "className" | "title" | "aria-label"> & {
  href?: never;
  isLoading?: boolean;
};

type LinkProps = ActionProps & Omit<ComponentPropsWithoutRef<typeof Link>, "children" | "className" | "title" | "aria-label"> & {
  href: ComponentPropsWithoutRef<typeof Link>["href"];
  isLoading?: never;
};

/** Icon-only controls for data-actions cells; form and page actions keep their visible labels. */
export function AdminRowAction({ action, label, isLoading = false, ...props }: ButtonProps | LinkProps) {
  const rule = rowActionRules[action];
  const Icon = rule.icon;
  const className = `inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${
    rule.tone === "danger"
      ? "text-danger hover:bg-danger-bg"
      : "text-ink-3 hover:bg-primary-tint hover:text-primary"
  }`;

  if (props.href !== undefined) {
    return <Link {...props} className={className} title={label} aria-label={label}><Icon className="h-4 w-4" aria-hidden="true" /></Link>;
  }

  const { disabled, type = "button", ...buttonProps } = props;
  return (
    <button {...buttonProps} type={type} disabled={disabled || isLoading} aria-busy={isLoading || undefined} className={className} title={label} aria-label={label}>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}
