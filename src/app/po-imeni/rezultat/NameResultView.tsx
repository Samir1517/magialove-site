"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { calcNameCompatibility } from "@/lib/engines/name-numerology";
import { getNameNumberArticle } from "@/lib/content/articles";
import { getVerdict } from "@/lib/engines/synthesis";
import { ArticleDisclosure } from "@/components/viz/ArticleDisclosure";
import { ScoreRing } from "@/components/viz/ScoreRing";
import { ShareActions } from "@/components/result/ShareActions";
import resultStyles from "@/components/result/result.module.css";
import contentStyles from "@/components/content/content.module.css";

function safely<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

export function NameResultView() {
  const params = useSearchParams();
  const nameA = params.get("a")?.trim() ?? "";
  const nameB = params.get("b")?.trim() ?? "";

  const result = useMemo(() => {
    if (!nameA || !nameB) return null;
    return safely(() => calcNameCompatibility(nameA, nameB));
  }, [nameA, nameB]);

  if (!nameA || !nameB || !result) {
    return (
      <div className={resultStyles.wrap}>
        <p className={resultStyles.missing}>
          Не хватает данных для расчёта.{" "}
          <Link href="/po-imeni/">Вернитесь назад и укажите оба имени кириллицей</Link>.
        </p>
      </div>
    );
  }

  const { aNumbers, bNumbers } = result.rawFeatures;
  const articleA = getNameNumberArticle(aNumbers.expression);
  const articleB = getNameNumberArticle(bNumbers.expression);

  return (
    <div className={resultStyles.wrap}>
      <div className={resultStyles.topBar}>
        <Link href="/" className={resultStyles.brand}>
          СОВМЕСТИМОСТЬ
        </Link>
      </div>

      <div className={resultStyles.eyebrow}>По имени</div>
      <h1 className={resultStyles.title}>
        {nameA} и {nameB}
      </h1>
      <p className={resultStyles.lede}>
        Число Имени показывает манеру самоподачи каждого из вас, а не жизненную задачу.
        Для полного разбора пары по 4 системам нужны даты рождения — начни на{" "}
        <Link href="/">главной странице</Link>.
      </p>

      <ScoreRing
        percent={result.score}
        gradientId="name-ring"
        label="Совместимость чисел имени"
        caption={`Числа Имени: ${aNumbers.expression} и ${bNumbers.expression}.`}
      />

      <ShareActions
        nameA={nameA}
        nameB={nameB}
        score={result.score}
        verdictLabel={getVerdict(result.score).label}
        caption={["Расчёт по именам: Число Имени,", "Число Души и Число Личности"]}
        shareText="Наша совместимость по именам — посчитай свою на magialove.ru"
      />

      <div className={contentStyles.grid} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className={contentStyles.card}>
          <h2 style={{ font: "600 14px var(--font-body)", color: "var(--ink)", margin: "0 0 10px" }}>
            {nameA}
          </h2>
          <p style={{ font: "400 13px/1.7 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
            Число Имени: <strong>{aNumbers.expression}</strong> · Число Души:{" "}
            <strong>{aNumbers.soul}</strong> · Число Личности: <strong>{aNumbers.personality}</strong>
          </p>
        </div>
        <div className={contentStyles.card}>
          <h2 style={{ font: "600 14px var(--font-body)", color: "var(--ink)", margin: "0 0 10px" }}>
            {nameB}
          </h2>
          <p style={{ font: "400 13px/1.7 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>
            Число Имени: <strong>{bNumbers.expression}</strong> · Число Души:{" "}
            <strong>{bNumbers.soul}</strong> · Число Личности: <strong>{bNumbers.personality}</strong>
          </p>
        </div>
      </div>

      {articleA && (
        <div className={contentStyles.card}>
          <ArticleDisclosure
            article={articleA}
            eyebrow={`${nameA} · Число имени ${aNumbers.expression}`}
            moreHref={`/po-imeni/chislo-imeni/${aNumbers.expression}/`}
            moreLabel={`Число Имени ${aNumbers.expression}: манера самоподачи в паре →`}
          />
        </div>
      )}
      {articleB && aNumbers.expression !== bNumbers.expression && (
        <div className={contentStyles.card}>
          <ArticleDisclosure
            article={articleB}
            eyebrow={`${nameB} · Число имени ${bNumbers.expression}`}
            moreHref={`/po-imeni/chislo-imeni/${bNumbers.expression}/`}
            moreLabel={`Число Имени ${bNumbers.expression}: манера самоподачи в паре →`}
          />
        </div>
      )}

      <Link href="/po-imeni/" className={`btn ${resultStyles.backLink}`}>
        Рассчитать другую пару
      </Link>
    </div>
  );
}
