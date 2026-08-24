import { ARCANUM_GLYPHS } from "@/lib/content/matrix-arcana-glyphs";
import styles from "./content.module.css";

/**
 * Практика глифов для двоих — подход Шмакова, развёрнутый на пару.
 *
 * Подзаголовки глифов — h3 под h2 секции: иерархия та же, что и в остальных
 * блоках страницы аркана, без пропуска уровня.
 */
export function ArcanumGlyphs({ n, arcanumName }: { n: number; arcanumName: string }) {
  const set = ARCANUM_GLYPHS[n];
  if (!set) return null;

  return (
    <section className={styles.card} aria-labelledby={`glyphs-${n}`}>
      <h2 id={`glyphs-${n}`} className={styles.h2}>
        Как войти в состояние этого аркана вдвоём
      </h2>
      <p className={styles.text}>
        В традиции, идущей от Владимира Шмакова, аркан — это не предсказание и не
        «значение карты», а состояние, в которое входят. Карта при таком чтении собрана из
        символов-глифов, и у каждого свой внутренний тон. Осваивают их поодиночке, а потом
        берут все разом — как аккорд. Ниже каждый глиф прочитан не для одного человека, а
        для двоих: это то, что вы можете включить вместе.
      </p>

      {set.glyphs.map((g) => (
        <div key={g.symbol} style={{ marginBottom: 12 }}>
          <h3 style={{ font: "600 13px var(--font-body)", color: "var(--ink)", margin: "0 0 4px" }}>{g.symbol}</h3>
          <p style={{ font: "400 13px/1.7 var(--font-body)", color: "var(--ink-soft)", margin: 0 }}>{g.text}</p>
        </div>
      ))}

      <p className={styles.note}>
        Собранные вместе, эти состояния и дают то, чем {arcanumName} звучит в паре, —{" "}
        {set.chord}. На первых порах удерживаются два-три глифа; остальные подтягиваются с
        практикой. Это упражнение на внимание друг к другу, а не эзотерический ритуал:
        работает ровно настолько, насколько вы оба в нём участвуете.
      </p>
    </section>
  );
}
