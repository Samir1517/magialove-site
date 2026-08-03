import { forwardRef } from "react";
import { bandStyle, formatScore } from "@/components/viz/scale";

const W = 1080;
const H = 1350;

/**
 * Карточка результата для расшаривания (Instagram/VK Stories, мессенджеры).
 * Чистый SVG, а не скриншот страницы — так можно растрировать в PNG на лету
 * (canvas) без сторонних библиотек. forwardRef отдаёт узел наружу для этого.
 */
export const ShareCard = forwardRef<
  SVGSVGElement,
  { nameA: string; nameB: string; score: number; verdictLabel: string }
>(function ShareCard({ nameA, nameB, score, verdictLabel }, ref) {
  const band = bandStyle(score);
  const pct = formatScore(score);
  const title = nameA && nameB ? `${nameA} и ${nameB}` : "Твоя пара";

  return (
    <svg ref={ref} width={W} height={H} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cardBg" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fdf6f4" />
          <stop offset="55%" stopColor="#f9eef2" />
          <stop offset="100%" stopColor="#f4eefa" />
        </radialGradient>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={band.from} />
          <stop offset="100%" stopColor={band.to} />
        </linearGradient>
        <linearGradient id="logoGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eddcc4" />
          <stop offset="50%" stopColor="#d6bd98" />
          <stop offset="100%" stopColor="#b99d74" />
        </linearGradient>
      </defs>

      <rect width={W} height={H} fill="url(#cardBg)" />

      {/* мягкие цветные пятна фона, в духе главной страницы */}
      <circle cx={W * 0.08} cy={H * 0.12} r={210} fill="#edc4cd" opacity="0.35" />
      <circle cx={W * 0.95} cy={H * 0.85} r={260} fill="#cdbcdd" opacity="0.28" />

      {/* логотип-марка: два кольца */}
      <g transform={`translate(${W / 2 - 34}, 96)`}>
        <circle cx={22} cy={30} r={26} fill="none" stroke="url(#logoGold)" strokeWidth={5} />
        <circle cx={46} cy={30} r={26} fill="none" stroke="url(#logoGold)" strokeWidth={5} />
      </g>
      <text
        x={W / 2}
        y={205}
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontWeight={700}
        fontSize={28}
        letterSpacing={6}
        fill="#7a6a7d"
      >
        СОВМЕСТИМОСТЬ
      </text>

      {/* имена пары */}
      <text
        x={W / 2}
        y={330}
        textAnchor="middle"
        fontFamily="Playfair Display, Georgia, serif"
        fontStyle="italic"
        fontWeight={500}
        fontSize={54}
        fill="#4a3a4d"
      >
        {title}
      </text>

      {/* большое кольцо со значением */}
      <circle cx={W / 2} cy={730} r={280} fill="none" stroke="#efe6ec" strokeWidth={28} />
      <circle
        cx={W / 2}
        cy={730}
        r={280}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth={28}
        strokeLinecap="round"
        strokeDasharray={`${(2 * Math.PI * 280 * Math.min(100, Math.max(0, score))) / 100} ${2 * Math.PI * 280}`}
        transform={`rotate(-90 ${W / 2} 730)`}
      />
      <text
        x={W / 2}
        y={755}
        textAnchor="middle"
        fontFamily="Playfair Display, Georgia, serif"
        fontStyle="italic"
        fontWeight={500}
        fontSize={168}
        fill="#4a3a4d"
      >
        {pct}%
      </text>
      <text
        x={W / 2}
        y={840}
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontWeight={600}
        fontSize={30}
        letterSpacing={2}
        fill={band.ink}
      >
        {band.label.toUpperCase()}
      </text>

      {/* вердикт */}
      <text
        x={W / 2}
        y={1075}
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontWeight={600}
        fontSize={38}
        fill="#4a3a4d"
      >
        {verdictLabel}
      </text>
      <text
        x={W / 2}
        y={1130}
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontSize={26}
        fill="#8a7a8d"
      >
        Расчёт по 4 системам: Матрица судьбы, Нумерология,
      </text>
      <text
        x={W / 2}
        y={1166}
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontSize={26}
        fill="#8a7a8d"
      >
        Дизайн человека, Джйотиш
      </text>

      {/* подвал-водяной знак */}
      <rect x={0} y={H - 90} width={W} height={90} fill="#3a2c3d" />
      <text
        x={W / 2}
        y={H - 36}
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontWeight={700}
        fontSize={32}
        letterSpacing={1.5}
        fill="#eddcc4"
      >
        magialove.ru
      </text>
    </svg>
  );
});
