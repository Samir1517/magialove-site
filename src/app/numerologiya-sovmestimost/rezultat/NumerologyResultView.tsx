"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { calcNumerologyCompatibility } from "@/lib/engines/numerology";
import { makePerson, safely } from "@/lib/engines/person";
import { getVerdict } from "@/lib/engines/synthesis";
import { NumerologySection } from "@/components/systems/NumerologySection";
import { UpsellToFullCta } from "@/components/system-calc/UpsellToFullCta";
import { ShareActions } from "@/components/result/ShareActions";
import { formatScore } from "@/components/viz/scale";
import { NextSystems } from "@/components/result/NextSystems";
import resultStyles from "@/components/result/result.module.css";

export function NumerologyResultView() {
  const params = useSearchParams();
  const dateA = params.get("a");
  const dateB = params.get("b");
  const nameA = params.get("na")?.trim() || "Первый партнёр";
  const nameB = params.get("nb")?.trim() || "Второй партнёр";

  const report = useMemo(() => {
    if (!dateA || !dateB) return null;
    return safely(() => calcNumerologyCompatibility(makePerson(dateA), makePerson(dateB)));
  }, [dateA, dateB]);

  if (!dateA || !dateB || !report) {
    return (
      <div className={resultStyles.wrap}>
        <p className={resultStyles.missing}>
          Не хватает данных для расчёта.{" "}
          <Link href="/numerologiya-sovmestimost/">Вернитесь назад и укажите обе даты рождения</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className={resultStyles.wrap}>
      <div className={resultStyles.topBar}>
        <Link href="/" className={resultStyles.brand}>
          СОВМЕСТИМОСТЬ
        </Link>
      </div>

      <div className={resultStyles.eyebrow}>Нумерология</div>
      <h1 className={resultStyles.title}>
        {nameA !== "Первый партнёр" ? `${nameA} и ${nameB}` : "Твоя совместимость"} — {formatScore(report.score)}%
      </h1>
      <p className={resultStyles.lede}>
        Расчёт только по Нумерологии — число жизненного пути и психоматрица по датам рождения.
      </p>

      <NumerologySection report={report} nameA={nameA} nameB={nameB} />

      <ShareActions
        nameA={nameA !== "Первый партнёр" ? nameA : ""}
        nameB={nameB !== "Второй партнёр" ? nameB : ""}
        score={report.score}
        verdictLabel={getVerdict(report.score).label}
        caption={[
          "Расчёт по нумерологии: числа пути",
          "и Квадрат Пифагора",
        ]}
        shareText="Наша совместимость по нумерологии — посчитай свою на magialove.ru"
      />

      <UpsellToFullCta
        text="Матрица судьбы, Дизайн человека и Джйотиш смотрят на твою пару совсем другими методами. Когда все четыре сходятся в одном — это сильный сигнал."
        params={new URLSearchParams(params.toString())}
      />

      <NextSystems current="numerology" qs={params.toString()} hasTimes={Boolean(params.get("at") && params.get("bt"))} />

      <Link href="/numerologiya-sovmestimost/" className={`btn ${resultStyles.backLink}`}>
        Рассчитать другую пару
      </Link>
    </div>
  );
}
