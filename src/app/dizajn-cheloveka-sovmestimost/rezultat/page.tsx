import type { Metadata } from "next";
import { Suspense } from "react";
import { HumanDesignResultView } from "./HumanDesignResultView";
import styles from "@/components/result/result.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function HumanDesignResultPage() {
  return (
    <Suspense fallback={<div className={styles.wrap}>Считаем…</div>}>
      <HumanDesignResultView />
    </Suspense>
  );
}
