import type { Metadata } from "next";
import { Suspense } from "react";
import { JyotishResultView } from "./JyotishResultView";
import styles from "@/components/result/result.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function JyotishResultPage() {
  return (
    <Suspense fallback={<div className={styles.wrap}>Считаем…</div>}>
      <JyotishResultView />
    </Suspense>
  );
}
