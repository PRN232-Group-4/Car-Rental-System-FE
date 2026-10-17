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
      <div className={overlay ? `${styles.card} glass-admin` : styles.card}>
        <div className={styles.brand}>
          <p className={`${styles.wordmark} font-display font-black tracking-tight text-2xl sm:text-3xl text-ink`}>
            ThongDong.
          </p>
        </div>
        <div className={styles.track} aria-hidden="true">
          <span className={styles.indicator} />
        </div>
        <div className={styles.copy}>
          <p className={styles.title}>Đang tải trang...</p>
          <p className={styles.description}>Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    </div>
  );
}
