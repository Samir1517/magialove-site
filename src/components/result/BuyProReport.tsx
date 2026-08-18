"use client";

import { PRO_REPORT, proReportPaymentLink, type PairQuery } from "@/lib/payments/prodamus";
import styles from "./result.module.css";

/**
 * Кнопка покупки профессионального разбора.
 *
 * Вынесена отдельным компонентом, чтобы её можно было поставить куда угодно —
 * на продающую страницу, в конец бесплатного разбора, в письмо — не трогая
 * логику оплаты. Цена и название лежат в одном месте, в prodamus.ts.
 *
 * Пока поддомен платёжной формы не задан, компонент не рисует ничего. Так
 * сделано намеренно: лучше отсутствие кнопки, чем кнопка, ведущая в никуда.
 * Это же свойство работает как выключатель — разбор ещё дорабатывается, и
 * включить продажу можно будет одной строкой, когда он будет готов отдаваться.
 */
export function BuyProReport({
  pair,
  label = "Получить профессиональный разбор",
  note,
  orderId,
}: {
  /** Пара, за расчёт которой платят. Без неё кнопки нет — см. prodamus.ts. */
  pair: PairQuery;
  label?: string;
  /** Подпись под кнопкой: что человек получит и что будет дальше. */
  note?: string;
  orderId?: string;
}) {
  const href = proReportPaymentLink(pair, orderId);
  if (!href) return null;

  return (
    <div className={styles.buyProWrap}>
      <a className={styles.buyProBtn} href={href} rel="nofollow">
        {label} — {PRO_REPORT.price} ₽
      </a>
      <p className={styles.buyProNote}>
        {note ??
          "Оплата за разбор этой пары. Сразу после неё откроется страница с готовым разбором — её можно сохранить, переслать и скачать в PDF. Расчёт другой пары оплачивается отдельно."}
      </p>
    </div>
  );
}
