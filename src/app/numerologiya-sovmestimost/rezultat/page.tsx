import type { Metadata } from "next";
import { Suspense } from "react";
import { NumerologyResultView } from "./NumerologyResultView";
import styles from "@/components/result/result.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function NumerologyResultPage() {
  return (
    <Suspense fallback={<div className={styles.wrap}>Считаем…</div>}>
      <NumerologyResultView />
    </Suspense>
  );
}
