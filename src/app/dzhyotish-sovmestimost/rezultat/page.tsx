import { Suspense } from "react";
import { JyotishResultView } from "./JyotishResultView";
import styles from "@/components/result/result.module.css";

export default function JyotishResultPage() {
  return (
    <Suspense fallback={<div className={styles.wrap}>Считаем…</div>}>
      <JyotishResultView />
    </Suspense>
  );
}
