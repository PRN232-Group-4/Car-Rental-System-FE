import type { ComponentPropsWithoutRef, ReactNode } from "react";
import styles from "./AdminTable.module.css";

export { DataTable } from "@/components/ui/DataTable";
export type { DataTableProps } from "@/components/ui/DataTable";

export function AdminTableCard({ className = "", ...props }: ComponentPropsWithoutRef<"section">) {
  return <section {...props} className={`border-t border-td-ink ${className}`} />;
}

export function AdminTable({ className = "", ...props }: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="w-full max-w-full overflow-x-auto">
      <table {...props} className={`${styles.table} ${className}`} />
    </div>
  );
}

export function AdminTableEmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return <tr><td colSpan={colSpan} className={styles.empty}>{children}</td></tr>;
}
