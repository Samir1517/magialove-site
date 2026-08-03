/**
 * Замок домена для калькуляторов. Сайт — статический экспорт, весь JS расчёта
 * (включая эту проверку) уезжает в браузер целиком — спрятать логику полностью
 * нельзя технически, не отправляя дату рождения на сервер (а это прямо противоречит
 * заявленной приватности сервиса). Это НЕ защита от копирования кода тем, кто готов
 * его прочитать и вырезать проверку — это защита от самого дешёвого и частого
 * сценария кражи: кто-то скачивает всю папку out/ как есть и выкладывает на свой
 * домен без единой правки. Без правки в JS калькулятор на чужом домене просто
 * выбросит ошибку вместо результата.
 */

const DEFAULT_HOSTS = ["magialove.ru", "www.magialove.ru"];

function isAllowedHost(hostname: string): boolean {
  if (DEFAULT_HOSTS.includes(hostname)) return true;
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") return true;
  if (hostname.endsWith(".vercel.app")) return true;
  const extra = process.env.NEXT_PUBLIC_ALLOWED_HOSTS;
  if (extra && extra.split(",").map((h) => h.trim()).includes(hostname)) return true;
  return false;
}

export function isLicensedHost(): boolean {
  // На сервере (пререндер статики) хост неизвестен и это не браузер стороннего
  // сайта — пропускаем без проверки, страница ещё не "утекла" никуда.
  if (typeof window === "undefined") return true;
  return isAllowedHost(window.location.hostname);
}

export function assertLicensed(): void {
  if (!isLicensedHost()) {
    throw new Error(
      "Этот калькулятор рассчитан на работу только на magialove.ru — расчёт недоступен на этом домене."
    );
  }
}
