import { Suspense } from "react";
import { ResultView } from "./ResultView";
import styles from "./rezultat.module.css";

export default function ResultPage() {
  return (
    <Suspense fallback={<div className={styles.wrap}>Считаем…</div>}>
      <ResultView />
    </Suspense>
  );
}
