"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Ссылка, которая тащит за собой параметры расчёта.
 *
 * Зачем. Со страницы аркана человек идёт дальше — по связям к соседнему аркану,
 * оттуда к следующему. Если параметры теряются на первом же переходе, кнопка
 * «вернуться к расчёту» исчезает ровно там, где она нужнее всего: на второй-
 * третьей странице, когда обратный путь по кнопке браузера уже неочевиден.
 *
 * До гидрации и для краулеров рендерится чистый адрес без параметров — то есть
 * в индекс уходит канонический URL, а хвост появляется только у живого читателя,
 * который действительно пришёл из расчёта.
 */
export function KeepParamsLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const params = useSearchParams();
  const qs = params.toString();
  return (
    <Link href={qs ? `${href}?${qs}` : href} className={className}>
      {children}
    </Link>
  );
}
