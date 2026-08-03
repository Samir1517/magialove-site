import type { Metadata } from "next";
import { Suspense } from "react";
import { ResultView } from "./ResultView";
import styles from "./rezultat.module.css";

// Персональная страница результата (query-параметры дат) — не индексируем:
// уникальных вариаций почти бесконечно, контент тонкий/дублирующий вне контекста
// конкретной пары. follow: true — переходы на статьи внутри разбора не теряют вес.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ResultPage() {
  return (
    <Suspense fallback={<div className={styles.wrap}>Считаем…</div>}>
      <ResultView />
    </Suspense>
  );
}
