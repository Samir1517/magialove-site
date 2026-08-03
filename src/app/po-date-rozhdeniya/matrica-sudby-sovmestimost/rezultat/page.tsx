import type { Metadata } from "next";
import { Suspense } from "react";
import { MatrixResultView } from "./MatrixResultView";
import styles from "@/components/result/result.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function MatrixResultPage() {
  return (
    <Suspense fallback={<div className={styles.wrap}>Считаем…</div>}>
      <MatrixResultView />
    </Suspense>
  );
}
