/**
 * Платёжная ссылка Продамуса для профессионального разбора.
 *
 * КАК УСТРОЕНА ПРОДАЖА. Сервера у нас нет, сайт статический — значит принимать
 * оплату и выдавать доступ через базу мы не можем. Схема обходится без сервера:
 * человек платит на стороне Продамуса, а тот возвращает его на нашу страницу
 * разбора. Страница закрыта от индексации, форма на ней своя, расчёт идёт в
 * браузере. Продамусу ничего про нас знать не нужно, кроме адреса возврата.
 *
 * ОДНА ОПЛАТА — ОДНА ПАРА. Поэтому данные рождения собираются ДО оплаты и
 * уезжают в адресе возврата. Человек платит за конкретную пару и возвращается
 * на страницу, где эта пара уже подставлена. Побочно получается то, что нужно:
 * адрес результата привязан к паре, его можно переслать кому угодно — там
 * всегда будет тот же разбор, а для новой пары нужен новый адрес.
 *
 * Если бы форму оставили ПОСЛЕ оплаты, одна покупка давала бы неограниченное
 * число расчётов: страница уже открыта, вводи любые даты.
 *
 * ЧЕСТНО ПРО ЗАЩИТУ. Адрес возврата не подписан: кто разберётся в формате,
 * подставит свои даты руками и посчитает вторую пару бесплатно. На статическом
 * сайте иначе не выходит — любая проверка на клиенте лежит в коде страницы и
 * снимается за минуту. Настоящее ограничение потребует серверной прослойки на
 * вебхуках Продамуса; до тех пор это осознанный компромисс.
 *
 * Параметры взяты из документации Продамуса по самостоятельной интеграции:
 * products[N][name|price|quantity], urlSuccess, urlReturn, do=pay.
 */

/**
 * Поддомен платёжной формы вида «имя.payform.ru».
 *
 * Пока не заполнен — кнопка оплаты сознательно не рисуется, чтобы на сайт не
 * попала ссылка в никуда. Подставить сюда адрес из кабинета Продамуса.
 */
export const PAYFORM_HOST = "";

export interface PaymentLinkParams {
  /** Название товара — оно же попадёт в фискальный чек покупателю. */
  productName: string;
  /** Цена в рублях. */
  price: number;
  /** Куда вернуть человека после успешной оплаты. */
  successUrl: string;
  /** Куда вернуть, если он передумал платить. */
  returnUrl: string;
  /** Свой номер заказа: помогает потом сопоставить оплату с обращением. */
  orderId?: string;
}

/**
 * Собирает ссылку на оплату. Возвращает null, если поддомен не задан, —
 * вызывающий код по этому признаку прячет кнопку.
 */
export function buildPaymentLink(p: PaymentLinkParams): string | null {
  if (!PAYFORM_HOST) return null;

  const q = new URLSearchParams();
  q.set("do", "pay");
  if (p.orderId) q.set("order_id", p.orderId);
  q.set("products[0][name]", p.productName);
  q.set("products[0][price]", String(p.price));
  q.set("products[0][quantity]", "1");
  q.set("urlSuccess", p.successUrl);
  q.set("urlReturn", p.returnUrl);

  return `https://${PAYFORM_HOST}/?${q.toString()}`;
}

/** Товар, который продаём сейчас. Цена и название — в одном месте. */
export const PRO_REPORT = {
  name: "Профессиональный разбор совместимости пары",
  price: 750,
  /** Страница, куда Продамус вернёт после оплаты — уже с данными пары. */
  successPath: "/dizajn-cheloveka-sovmestimost/razbor-professionalnyj/pochemu-imenno-on/rezultat/",
  /** Куда вернуть, если оплату не завершил. */
  returnPath: "/dizajn-cheloveka-sovmestimost/razbor-professionalnyj/pochemu-imenno-on/",
} as const;

const SITE = "https://magialove.ru";

/** Данные пары, за расчёт которой человек платит. */
export interface PairQuery {
  /** ГГГГ-ММ-ДД и ЧЧ:ММ каждого, плюс часовой пояс и координаты города. */
  a: string;
  at: string;
  atz: string;
  alat?: number;
  alon?: number;
  b: string;
  bt: string;
  btz: string;
  blat?: number;
  blon?: number;
  na?: string;
  nb?: string;
}

/** Строка параметров пары — ровно та, что понимает страница разбора. */
export function pairQueryString(p: PairQuery): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && String(v) !== "") q.set(k, String(v));
  }
  return q.toString();
}

/**
 * Ссылка на оплату разбора конкретной пары.
 *
 * Данные пары вшиваются в адрес возврата: после оплаты человек попадает на
 * страницу, где эта пара уже посчитана. Без данных ссылку не собираем — иначе
 * оплата открыла бы страницу с пустой формой и любым числом расчётов.
 */
export function proReportPaymentLink(pair: PairQuery, orderId?: string): string | null {
  return buildPaymentLink({
    productName: PRO_REPORT.name,
    price: PRO_REPORT.price,
    successUrl: `${SITE}${PRO_REPORT.successPath}?${pairQueryString(pair)}`,
    returnUrl: SITE + PRO_REPORT.returnPath,
    orderId,
  });
}
