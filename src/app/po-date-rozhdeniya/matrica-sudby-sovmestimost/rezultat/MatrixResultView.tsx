"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { calcMatrixCompatibility } from "@/lib/engines/matrix";
import { makePerson, safely } from "@/lib/engines/person";
import { getVerdict } from "@/lib/engines/synthesis";
import { MatrixSection } from "@/components/systems/MatrixSection";
import { UpsellToFullCta } from "@/components/system-calc/UpsellToFullCta";
import { ShareActions } from "@/components/result/ShareActions";
import { formatScore } from "@/components/viz/scale";
import resultStyles from "@/components/result/result.module.css";

export function MatrixResultView() {
  const params = useSearchParams();
  const dateA = params.get("a");
  const dateB = params.get("b");
  const nameA = params.get("na")?.trim() || "Первый партнёр";
  const nameB = params.get("nb")?.trim() || "Второй партнёр";

  const report = useMemo(() => {
    if (!dateA || !dateB) return null;
    return safely(() => calcMatrixCompatibility(makePerson(dateA), makePerson(dateB)));
  }, [dateA, dateB]);

  if (!dateA || !dateB || !report) {
    return (
      <div className={resultStyles.wrap}>
        <p className={resultStyles.missing}>
          Не хватает данных для расчёта.{" "}
          <Link href="/po-date-rozhdeniya/matrica-sudby-sovmestimost/">Вернитесь назад и укажите обе даты рождения</Link>.
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

      <div className={resultStyles.eyebrow}>Матрица судьбы</div>
      <h1 className={resultStyles.title}>
        {nameA !== "Первый партнёр" ? `${nameA} и ${nameB}` : "Твоя совместимость"} — {formatScore(report.score)}%
      </h1>
      <p className={resultStyles.lede}>
        Расчёт только по Матрице судьбы — по датам рождения, без времени и места.
      </p>

      <ShareActions
        nameA={nameA !== "Первый партнёр" ? nameA : ""}
        nameB={nameB !== "Второй партнёр" ? nameB : ""}
        score={report.score}
        verdictLabel={getVerdict(report.score).label}
      />

      <MatrixSection report={report} />

      <UpsellToFullCta
        text="Нумерология, Дизайн человека и Джйотиш смотрят на твою пару совсем другими методами. Когда все четыре сходятся в одном — это сильный сигнал."
        params={new URLSearchParams(params.toString())}
      />

      <Link href="/po-date-rozhdeniya/matrica-sudby-sovmestimost/" className={`btn ${resultStyles.backLink}`}>
        Рассчитать другую пару
      </Link>
    </div>
  );
}
