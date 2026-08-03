/**
 * Замена <image-slot> из исходного дизайна (инструмент дизайн-редактора,
 * недоступен в проде и подразумевал фото пары/женщины). Вместо фотографии —
 * собственная абстрактная иллюстрация двух пересекающихся орбит в той же
 * палитре: две фигуры сближаются, не сливаясь, — образ, который держит тон
 * сервиса (мягко, без клише вроде сердечек или силуэтов пары).
 */
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 420"
      width="100%"
      height="100%"
      role="img"
      aria-label="Две пересекающиеся орбиты — символ совместимости двоих"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="heroBg" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="#FDF4F6" />
          <stop offset="100%" stopColor="#F4EEFA" />
        </radialGradient>
        <linearGradient id="orbitA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EDC4CD" />
          <stop offset="100%" stopColor="#D48CA6" />
        </linearGradient>
        <linearGradient id="orbitB" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D6BD98" />
          <stop offset="100%" stopColor="#B99D74" />
        </linearGradient>
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="480" height="420" fill="url(#heroBg)" />

      <g opacity="0.9">
        <ellipse
          cx="190"
          cy="210"
          rx="128"
          ry="128"
          fill="none"
          stroke="url(#orbitA)"
          strokeWidth="2"
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
        <ellipse
          cx="300"
          cy="210"
          rx="128"
          ry="128"
          fill="none"
          stroke="url(#orbitB)"
          strokeWidth="2"
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
      </g>

      <circle cx="190" cy="210" r="54" fill="url(#orbitA)" opacity="0.85" />
      <circle cx="300" cy="210" r="54" fill="url(#orbitB)" opacity="0.85" />
      <circle cx="245" cy="210" r="46" fill="url(#coreGlow)" />

      <circle cx="150" cy="130" r="4" fill="#D48CA6" opacity="0.7" />
      <circle cx="360" cy="290" r="5" fill="#B99D74" opacity="0.6" />
      <circle cx="120" cy="300" r="3" fill="#D6BD98" opacity="0.7" />
      <circle cx="340" cy="120" r="4" fill="#EDC4CD" opacity="0.8" />
    </svg>
  );
}
