import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./AdminTable.module.css";

export function AdminTableCard({ className = "", ...props }: ComponentPropsWithoutRef<"section">) {
  return <section {...props} className={`overflow-hidden rounded-2xl border border-line bg-surface shadow-e1 ${className}`} />;
}

export function AdminTable({ className = "", ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="overflow-x-auto">
      <table {...props} className={`${styles.table} ${className}`} />
    </div>
  );
}

export function AdminTableEmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return <tr><td colSpan={colSpan} className={styles.empty}>{children}</td></tr>;
}
