import styles from "./transit-desk.module.css";

export function NavigationDot({ hasWork }: { hasWork: boolean }) {
  if (!hasWork) return null;
  return <>
    <span className={styles.navigationDot} aria-hidden="true" />
    <span className="sr-only">, có hồ sơ mới cần xử lý</span>
  </>;
}

export function NavigationCount({ count }: { count: number }) {
  if (count <= 0) return null;
  return <span className={styles.navigationCount}>
    <span aria-hidden="true">{count}</span>
    <span className="sr-only">, {count} hồ sơ mới cần xử lý</span>
  </span>;
}
