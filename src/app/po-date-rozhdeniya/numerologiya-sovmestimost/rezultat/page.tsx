import { Suspense } from "react";
import { NumerologyResultView } from "./NumerologyResultView";
import styles from "@/components/result/result.module.css";

export default function NumerologyResultPage() {
  return (
    <Suspense fallback={<div className={styles.wrap}>Считаем…</div>}>
      <NumerologyResultView />
    </Suspense>
  );
}
