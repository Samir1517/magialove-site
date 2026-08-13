"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { calcHumanDesignCompatibility } from "@/lib/engines/human_design";
import { makePerson, safely } from "@/lib/engines/person";
import { calcSaturnAddition } from "@/lib/engines/saturn-return";
import { getVerdict } from "@/lib/engines/synthesis";
import { HumanDesignSection } from "@/components/systems/HumanDesignSection";
import { UpsellToFullCta } from "@/components/system-calc/UpsellToFullCta";
import { DateTimeForm } from "@/components/system-calc/DateTimeForm";
import { ShareActions } from "@/components/result/ShareActions";
import { formatScore } from "@/components/viz/scale";
import resultStyles from "@/components/result/result.module.css";

export function HumanDesignResultView() {
  const params = useSearchParams();
  const dateA = params.get("a");
  const dateB = params.get("b");
  const timeA = params.get("at");
  const timeB = params.get("bt");
  const tzA = params.get("atz") ?? undefined;
  const tzB = params.get("btz") ?? undefined;
  const nameA = params.get("na")?.trim() || "Первый партнёр";
  const nameB = params.get("nb")?.trim() || "Второй партнёр";

  const report = useMemo(() => {
    if (!dateA || !dateB || !timeA || !timeB) return null;
    return safely(() =>
      calcHumanDesignCompatibility(makePerson(dateA, timeA, tzA), makePerson(dateB, timeB, tzB))
    );
  }, [dateA, dateB, timeA, timeB, tzA, tzB]);

  // Карта возврата Сатурна считается отдельно и лениво: это ещё два прохода по
  // эфемеридам на человека, и общему результату по 4 системам она не нужна.
  const saturn = useMemo(() => {
    if (!dateA || !dateB || !timeA || !timeB) return null;
    return safely(() =>
      calcSaturnAddition(makePerson(dateA, timeA, tzA), makePerson(dateB, timeB, tzB))
    );
  }, [dateA, dateB, timeA, timeB, tzA, tzB]);

  if (!dateA || !dateB || !timeA || !timeB || !report) {
    return (
      <div className={resultStyles.wrap}>
        <div className={resultStyles.topBar}>
          <Link href="/" className={resultStyles.brand}>
            СОВМЕСТИМОСТЬ
          </Link>
        </div>
        <div className={resultStyles.eyebrow}>Дизайн человека</div>
        <h1 className={resultStyles.title}>Расчёт композита пары</h1>
        <p className={resultStyles.lede}>
          Дизайн человека считает не дату, а момент рождения — введите даты, время и часовой
          пояс обоих партнёров.
        </p>
        <DateTimeForm targetPath="/dizajn-cheloveka-sovmestimost/rezultat" />
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

      <div className={resultStyles.eyebrow}>Дизайн человека</div>
      <h1 className={resultStyles.title}>
        {nameA !== "Первый партнёр" ? `${nameA} и ${nameB}` : "Твоя совместимость"} — {formatScore(report.score)}%
      </h1>
      <p className={resultStyles.lede}>
        Расчёт только по Дизайну человека — композит пары по точному моменту рождения обоих.
      </p>

      <HumanDesignSection report={report} nameA={nameA} nameB={nameB} saturn={saturn} />

      <ShareActions
        nameA={nameA !== "Первый партнёр" ? nameA : ""}
        nameB={nameB !== "Второй партнёр" ? nameB : ""}
        score={report.score}
        verdictLabel={getVerdict(report.score).label}
        caption={[
          "Расчёт по Дизайну человека:",
          "композит пары по моменту рождения",
        ]}
        shareText="Наша совместимость по Дизайну человека — посчитай свою на magialove.ru"
      />

      <UpsellToFullCta
        text="Матрица судьбы, Нумерология и Джйотиш смотрят на твою пару совсем другими методами. Когда все четыре сходятся в одном — это сильный сигнал."
        params={new URLSearchParams(params.toString())}
      />

      <Link href="/dizajn-cheloveka-sovmestimost/" className={`btn ${resultStyles.backLink}`}>
        Рассчитать другую пару
      </Link>
    </div>
  );
}
