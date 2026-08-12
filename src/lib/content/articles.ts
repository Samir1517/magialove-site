/**
 * Типизированный доступ к статьям, собранным `scripts/build-content-data.ts`
 * из 69 исходных .md в site/src/lib/content-data/*.json. Ключи в каждом файле
 * совпадают с ключами соответствующего движка (номер аркана, число жизненного
 * пути, ConnectionThemeKey и т.д.) — см. комментарии в скрипте сборки.
 */

import matrixArcanaData from "../content-data/matrix-arcana.json";
import lifePathData from "../content-data/numerology-life-path.json";
import psychomatrixData from "../content-data/numerology-psychomatrix.json";
import nameNumberData from "../content-data/numerology-name-number.json";
import hdTypesData from "../content-data/hd-types.json";
import hdAuthoritiesData from "../content-data/hd-authorities.json";
import hdConnectionsData from "../content-data/hd-connections.json";
import hdChannelsData from "../content-data/hd-channels.json";
import hdProfilesData from "../content-data/hd-profiles.json";
import jyotishKutasData from "../content-data/jyotish-kutas.json";
import jyotishDoshasData from "../content-data/jyotish-doshas.json";
import jyotishNakshatrasData from "../content-data/jyotish-nakshatras.json";

export interface Article {
  title: string;
  meta: string[];
  capsule: string;
  sections: { heading: string; body: string }[];
  disclaimer: string;
}

type ArticleMap = Record<string, Article>;

const MATRIX_ARCANA = matrixArcanaData as ArticleMap;
const LIFE_PATH = lifePathData as ArticleMap;
const PSYCHOMATRIX = psychomatrixData as ArticleMap;
const NAME_NUMBER = nameNumberData as ArticleMap;
const HD_TYPES = hdTypesData as ArticleMap;
const HD_AUTHORITIES = hdAuthoritiesData as ArticleMap;
const HD_CONNECTIONS = hdConnectionsData as ArticleMap;
const HD_CHANNELS = hdChannelsData as ArticleMap;
const HD_PROFILES = hdProfilesData as ArticleMap;
const JYOTISH_KUTAS = jyotishKutasData as ArticleMap;
const JYOTISH_DOSHAS = jyotishDoshasData as ArticleMap;
const JYOTISH_NAKSHATRAS = jyotishNakshatrasData as ArticleMap;

export function getMatrixArticle(arcanum: number): Article | null {
  return MATRIX_ARCANA[String(arcanum)] ?? null;
}

export function getLifePathArticle(n: number): Article | null {
  return LIFE_PATH[String(n)] ?? null;
}

export function getPsychomatrixArticle(key: string): Article | null {
  return PSYCHOMATRIX[key] ?? null;
}

export function getNameNumberArticle(n: number): Article | null {
  return NAME_NUMBER[String(n)] ?? null;
}

export function getHDTypeArticle(type: string): Article | null {
  return HD_TYPES[type] ?? null;
}

export function getHDAuthorityArticle(authority: string): Article | null {
  return HD_AUTHORITIES[authority] ?? null;
}

export function getHDConnectionArticle(theme: string): Article | null {
  return HD_CONNECTIONS[theme] ?? null;
}

/** Ключ вида "1-8" — как в CHANNELS (human-design-tables.ts) и composite.channels. */
export function getHDChannelArticle(channelKey: string): Article | null {
  return HD_CHANNELS[channelKey] ?? null;
}

/** Ключ вида "1/3" — ровно то, что отдаёт движок в `person.profile`. */
export function getHDProfileArticle(profile: string): Article | null {
  return HD_PROFILES[profile] ?? null;
}

/** "1/3" → "1-3": слэш в сегменте URL недопустим. */
export function profileSlug(profile: string): string {
  return profile.replace("/", "-");
}

/** "1-3" → "1/3": обратное преобразование для страницы [profile]. */
export function profileFromSlug(slug: string): string {
  return slug.replace("-", "/");
}

export function getJyotishKutaArticle(key: string): Article | null {
  return JYOTISH_KUTAS[key] ?? null;
}

export function getJyotishDoshaArticle(key: string): Article | null {
  return JYOTISH_DOSHAS[key] ?? null;
}

export function getJyotishNakshatraArticle(index: number): Article | null {
  return JYOTISH_NAKSHATRAS[String(index)] ?? null;
}

export function allMatrixArticles(): ArticleMap {
  return MATRIX_ARCANA;
}
export function allLifePathArticles(): ArticleMap {
  return LIFE_PATH;
}
export function allPsychomatrixArticles(): ArticleMap {
  return PSYCHOMATRIX;
}
export function allNameNumberArticles(): ArticleMap {
  return NAME_NUMBER;
}
export function allHDTypeArticles(): ArticleMap {
  return HD_TYPES;
}
export function allHDAuthorityArticles(): ArticleMap {
  return HD_AUTHORITIES;
}
export function allHDConnectionArticles(): ArticleMap {
  return HD_CONNECTIONS;
}
export function allHDChannelArticles(): ArticleMap {
  return HD_CHANNELS;
}
export function allHDProfileArticles(): ArticleMap {
  return HD_PROFILES;
}
export function allJyotishKutaArticles(): ArticleMap {
  return JYOTISH_KUTAS;
}
export function allJyotishDoshaArticles(): ArticleMap {
  return JYOTISH_DOSHAS;
}
export function allJyotishNakshatraArticles(): ArticleMap {
  return JYOTISH_NAKSHATRAS;
}
