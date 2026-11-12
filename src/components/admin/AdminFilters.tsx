"use client";

import { useId } from "react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Filter, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./AdminFilters.module.css";

export function AdminFilterBar({ title = "Bộ lọc", description, children, actions }: {
  title?: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const titleId = useId();
  return <section className={styles.bar} data-admin-filters aria-labelledby={titleId}>
    <div className={styles.heading}>
      <h2 id={titleId}>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    <div className={styles.toolbar}>
      <div className={styles.fields}>{children}</div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  </section>;
}

export function AdminFilterField({ label, htmlFor, icon: Icon, children }: {
  label: string;
  htmlFor: string;
  icon?: LucideIcon;
  /** Kept for call-site compatibility; the shared Select draws its own chevron. */
  select?: boolean;
  children: ReactNode;
}) {
  return <div className={styles.field}>
    <label htmlFor={htmlFor}>{label}</label>
    <div className={`${styles.control} ${Icon ? styles.withIcon : ""}`}>
      {Icon && <Icon className={styles.leadingIcon} aria-hidden="true" />}
      {children}
    </div>
  </div>;
}

export function AdminFilterButton({ variant = "primary", children, className = "", type = "button", ...props }: ComponentPropsWithoutRef<"button"> & {
  variant?: "primary" | "secondary";
}) {
  const Icon = variant === "secondary" ? RotateCcw : Filter;
  return <button {...props} type={type} className={`${styles.button} ${variant === "secondary" ? styles.secondary : styles.primary} ${className}`}>
    <Icon aria-hidden="true" />{children}
  </button>;
}
