import type { Metadata } from "next";
import { Suspense } from "react";
import { ProReportView } from "./ProReportView";

/**
 * Страница результата платного разбора «Почему именно он».
 *
 * Закрыта от индексации: сюда приходят по ссылке после оплаты, и в поиске ей
 * делать нечего. follow оставлен — ссылки на открытые разделы пусть работают.
 */
export const metadata: Metadata = {
  title: "Почему именно он — профессиональный разбор пары",
  robots: { index: false, follow: true },
};

export default function ProReportPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: 60 }}>Считаем…</div>}>
      <ProReportView />
    </Suspense>
  );
}
