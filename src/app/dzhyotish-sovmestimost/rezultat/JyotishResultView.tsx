"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { calcJyotishCompatibility, calcNavagraha } from "@/lib/engines/jyotish";
import { makePerson, safely } from "@/lib/engines/person";
import { getVerdict } from "@/lib/engines/synthesis";
import { JyotishSection } from "@/components/systems/JyotishSection";
import { UpsellToFullCta } from "@/components/system-calc/UpsellToFullCta";
import { DateTimeForm } from "@/components/system-calc/DateTimeForm";
import { ShareActions } from "@/components/result/ShareActions";
import { Biwheel } from "@/components/viz/Biwheel";
import { formatScore } from "@/components/viz/scale";
import resultStyles from "@/components/result/result.module.css";
import systemStyles from "@/components/systems/systems.module.css";

export function JyotishResultView() {
  const params = useSearchParams();
  const dateA = params.get("a");
  const dateB = params.get("b");
  const timeA = params.get("at");
  const timeB = params.get("bt");
  const tzA = params.get("atz") ?? undefined;
  const tzB = params.get("btz") ?? undefined;
  const nameA = params.get("na")?.trim() || "Первый партнёр";
  const nameB = params.get("nb")?.trim() || "Второй партнёр";

  const data = useMemo(() => {
    if (!dateA || !dateB || !timeA || !timeB) return null;
    const a = makePerson(dateA, timeA, tzA);
    const b = makePerson(dateB, timeB, tzB);
    const report = safely(() => calcJyotishCompatibility(a, b));
    if (!report) return null;
    const grahas = safely(() => ({ a: calcNavagraha(a), b: calcNavagraha(b) }));
    return { report, grahas };
  }, [dateA, dateB, timeA, timeB, tzA, tzB]);

  if (!dateA || !dateB || !timeA || !timeB || !data) {
    return (
      <div className={resultStyles.wrap}>
        <div className={resultStyles.topBar}>
          <Link href="/" className={resultStyles.brand}>
            СОВМЕСТИМОСТЬ
          </Link>
        </div>
        <div className={resultStyles.eyebrow}>Джйотиш</div>
        <h1 className={resultStyles.title}>Расчёт Гуна-милан</h1>
        <p className={resultStyles.lede}>
          Джйотиш считает не дату, а момент рождения — введите даты, время и часовой пояс
          обоих партнёров.
        </p>
        <DateTimeForm targetPath="/dzhyotish-sovmestimost/rezultat" />
      </div>
    );
  }

  const { report, grahas } = data;

  return (
    <div className={resultStyles.wrap}>
      <div className={resultStyles.topBar}>
        <Link href="/" className={resultStyles.brand}>
          СОВМЕСТИМОСТЬ
        </Link>
      </div>

      <div className={resultStyles.eyebrow}>Джйотиш</div>
      <h1 className={resultStyles.title}>
        {nameA !== "Первый партнёр" ? `${nameA} и ${nameB}` : "Твоя совместимость"} — {formatScore(report.score)}%
      </h1>
      <p className={resultStyles.lede}>
        Расчёт только по Джйотиш — Гуна-милан и доши по точному моменту рождения обоих.
      </p>

      <JyotishSection report={report} nameA={nameA} nameB={nameB} grahas={grahas} />

      <ShareActions
        nameA={nameA !== "Первый партнёр" ? nameA : ""}
        nameB={nameB !== "Второй партнёр" ? nameB : ""}
        score={report.score}
        verdictLabel={getVerdict(report.score).label}
        caption={[
          "Расчёт по Джйотиш: Аштакута Гуна-милан,",
          "36 баллов и три доши",
        ]}
        shareText="Наша совместимость по Джйотиш — посчитай свою на magialove.ru"
      />

      {grahas && (
        <section className={systemStyles.section} aria-labelledby="biwheel-title">
          <div className={systemStyles.sectionHead}>
            <div className={systemStyles.eyebrow}>Биколесо</div>
            <h2 id="biwheel-title" className={systemStyles.sectionTitle}>
              Две карты в одном круге
            </h2>
            <p className={systemStyles.sectionLede}>
              Внутреннее кольцо — {nameA}, внешнее — {nameB}. Линии в центре показывают
              синастрические аспекты: золотые — соединения, розовые — гармоничные, лиловые —
              напряжённые.
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Biwheel aGrahas={grahas.a} bGrahas={grahas.b} nameA={nameA} nameB={nameB} />
          </div>
        </section>
      )}

      <UpsellToFullCta
        text="Матрица судьбы, Нумерология и Дизайн человека смотрят на твою пару совсем другими методами. Когда все четыре сходятся в одном — это сильный сигнал."
        params={new URLSearchParams(params.toString())}
      />

      <Link href="/dzhyotish-sovmestimost/" className={`btn ${resultStyles.backLink}`}>
        Рассчитать другую пару
      </Link>
    </div>
  );
}
