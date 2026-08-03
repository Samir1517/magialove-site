import styles from "./viz.module.css";

export interface LegendEntry {
  color: string;
  text: string;
}

export function Legend({ entries }: { entries: LegendEntry[] }) {
  return (
    <div className={styles.legend}>
      {entries.map((e) => (
        <span key={e.text} className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: e.color }} aria-hidden="true" />
          {e.text}
        </span>
      ))}
    </div>
  );
}

export function Chip({
  children,
  color,
  background,
}: {
  children: React.ReactNode;
  color: string;
  background: string;
}) {
  return (
    <span className={styles.chip} style={{ color, background }}>
      {children}
    </span>
  );
}
