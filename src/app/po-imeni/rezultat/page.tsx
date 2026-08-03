import type { Metadata } from "next";
import { Suspense } from "react";
import { NameResultView } from "./NameResultView";
import resultStyles from "@/components/result/result.module.css";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function NameResultPage() {
  return (
    <Suspense fallback={<div className={resultStyles.wrap}>Считаем…</div>}>
      <NameResultView />
    </Suspense>
  );
}
