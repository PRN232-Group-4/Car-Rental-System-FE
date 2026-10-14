import { LoaderCircle } from "lucide-react";
import styles from "./navigation.module.css";

export function PageLoading({ overlay = false }: { overlay?: boolean }) {
  return (
    <div
      className={overlay ? styles.overlay : styles.page}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-page-loading="true"
    >
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          <LoaderCircle className={styles.spinner} />
        </span>
        <div>
          <p className={styles.title}>Đang tải trang...</p>
          <p className={styles.description}>Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    </div>
  );
}
