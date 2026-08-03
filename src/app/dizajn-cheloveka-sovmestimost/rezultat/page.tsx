import { Suspense } from "react";
import { HumanDesignResultView } from "./HumanDesignResultView";
import styles from "@/components/result/result.module.css";

export default function HumanDesignResultPage() {
  return (
    <Suspense fallback={<div className={styles.wrap}>Считаем…</div>}>
      <HumanDesignResultView />
    </Suspense>
  );
}
