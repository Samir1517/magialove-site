import { Suspense } from "react";
import { NameResultView } from "./NameResultView";
import resultStyles from "@/components/result/result.module.css";

export default function NameResultPage() {
  return (
    <Suspense fallback={<div className={resultStyles.wrap}>Считаем…</div>}>
      <NameResultView />
    </Suspense>
  );
}
