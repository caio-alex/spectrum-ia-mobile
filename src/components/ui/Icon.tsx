// src/components/ui/Icon.tsx
//
// Um único ponto de entrada para iconografia. Antes o app usava emoji — que
// muda de desenho a cada sistema operacional, não aceita cor e não tem peso
// visual consistente. Aqui todo ícone é vetor, herda cor do tema e tem o mesmo
// traço, o que é boa parte do que faz uma interface "parecer de alguém".
//
// Para usar um ícone novo: importe do pacote e registre no mapa abaixo com um
// nome semântico (o que ele significa), nunca com o nome do desenho.

import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faArrowUpRightFromSquare,
  faBolt,
  faBookOpen,
  faBoxOpen,
  faBrain,
  faBuilding,
  faCalendar,
  faCarSide,
  faChair,
  faChartColumn,
  faChartLine,
  faCheck,
  faCheckDouble,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleNodes,
  faClock,
  faCompactDisc,
  faCouch,
  faDatabase,
  faDownload,
  faEnvelope,
  faFileCsv,
  faFilePdf,
  faFolder,
  faFolderOpen,
  faGasPump,
  faGauge,
  faGears,
  faHouse,
  faIdBadge,
  faLayerGroup,
  faLightbulb,
  faLink,
  faListCheck,
  faLock,
  faMagnifyingGlass,
  faMicrochip,
  faMountain,
  faPlus,
  faRightFromBracket,
  faRocket,
  faRotate,
  faRulerCombined,
  faSatelliteDish,
  faScaleBalanced,
  faShieldHalved,
  faSnowflake,
  faSun,
  faTriangleExclamation,
  faTv,
  faUser,
  faWandMagicSparkles,
  faWifi,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { theme, type Hue } from '../../styles/theme';

/** Nomes semânticos → glifos. A tela nunca conhece o nome do desenho. */
export const ICONS = {
  // navegação
  home: faHouse,
  search: faMagnifyingGlass,
  sessions: faFolder,
  sessionOpen: faFolderOpen,
  profile: faUser,
  back: faArrowLeft,
  forward: faArrowRight,
  chevronRight: faChevronRight,
  chevronLeft: faChevronLeft,
  chevronDown: faChevronDown,
  close: faXmark,
  external: faArrowUpRightFromSquare,
  logout: faRightFromBracket,
  lock: faLock,

  // ações
  add: faPlus,
  check: faCheck,
  checkAll: faCheckDouble,
  download: faDownload,
  retry: faRotate,

  // objetos do domínio
  vehicle: faCarSide,
  compare: faScaleBalanced,
  fields: faLayerGroup,
  sources: faDatabase,
  link: faLink,
  scan: faSatelliteDish,
  ai: faWandMagicSparkles,
  confidence: faBrain,
  time: faClock,
  chart: faChartColumn,
  trend: faChartLine,
  categories: faListCheck,
  date: faCalendar,
  company: faBuilding,
  email: faEnvelope,
  role: faIdBadge,
  network: faCircleNodes,
  csv: faFileCsv,
  pdf: faFilePdf,

  // estados
  info: faCircleInfo,
  warning: faTriangleExclamation,
  error: faCircleExclamation,
  success: faCircleCheck,
  tip: faLightbulb,
  spark: faBolt,

  // categorias de pesquisa
  catEngine: faGears,
  catWheels: faCompactDisc,
  catConnectivity: faWifi,
  catMedia: faTv,
  catClimate: faSnowflake,
  catSafety: faShieldHalved,
  catTech: faRocket,
  catLocks: faLock,
  catInterior: faCouch,
  catSunroof: faSun,
  catSeats: faChair,
  catLighting: faLightbulb,
  catOffroad: faMountain,
  catOther: faBoxOpen,
  catPerformance: faGauge,
  catEfficiency: faGasPump,
  catDimensions: faRulerCombined,
  catWarranty: faBookOpen,
  catConnectivityAlt: faMicrochip,
} as const;

export type IconName = keyof typeof ICONS;

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const Icon: React.FC<Props> = ({ name, size = 16, color = theme.colors.text, style }) => (
  <FontAwesomeIcon icon={ICONS[name]} size={size} color={color} style={style as never} />
);

/* ── Identidade das categorias ───────────────────────────────────────────── */

export interface CategoryIdentity {
  icon: IconName;
  /** Cor sólida — ícone, borda e anel do estado selecionado. */
  color: string;
}

/**
 * Ícone E cor de uma categoria, resolvidos juntos.
 *
 * O nome chega do backend com acento, caixa variada e redações diferentes entre
 * a tela de pesquisa e a de comparação ("Motor e Transmissão" vs. "Motor e
 * Desempenho"). Por isso casamos por palavra-chave, e não por igualdade exata —
 * assim a mesma categoria mantém a mesma cara nas duas telas.
 *
 * A cor sai de `theme.hues`: o azul continua sendo o dono da moldura do app;
 * estes matizes vivem só dentro do conteúdo, onde 14 blocos idênticos em azul
 * transformavam a escolha em leitura de texto em vez de reconhecimento visual.
 */
const CATEGORY_RULES: Array<{ match: string[]; icon: IconName; hue: Hue }> = [
  { match: ['motor', 'transmiss', 'desempenho', 'performance'], icon: 'catEngine', hue: 'ember' },
  { match: ['roda', 'pneu'], icon: 'catWheels', hue: 'graphite' },
  { match: ['conectiv'], icon: 'catConnectivity', hue: 'azure' },
  { match: ['entretenim', 'multimid'], icon: 'catMedia', hue: 'violet' },
  { match: ['ar-condicionado', 'climat'], icon: 'catClimate', hue: 'cyan' },
  { match: ['seguranc'], icon: 'catSafety', hue: 'green' },
  { match: ['tecnologia'], icon: 'catTech', hue: 'magenta' },
  { match: ['travament', 'vidro'], icon: 'catLocks', hue: 'indigo' },
  { match: ['acabament', 'interno', 'conforto'], icon: 'catInterior', hue: 'clay' },
  { match: ['teto'], icon: 'catSunroof', hue: 'sun' },
  { match: ['banco'], icon: 'catSeats', hue: 'petrol' },
  { match: ['ilumina', 'farol'], icon: 'catLighting', hue: 'amber' },
  { match: ['4x4', 'off-road', 'tracao'], icon: 'catOffroad', hue: 'olive' },
  { match: ['consumo', 'eficien'], icon: 'catEfficiency', hue: 'teal' },
  { match: ['dimens', 'capacidade'], icon: 'catDimensions', hue: 'indigo' },
  { match: ['garantia', 'revis'], icon: 'catWarranty', hue: 'slate' },
];

const normalize = (raw: string): string =>
  raw
    .normalize('NFD')
    .replace(new RegExp('[̀-ͯ]', 'g'), '')
    .toLowerCase();

export function categoryIdentity(rawName: string): CategoryIdentity {
  const key = normalize(rawName);
  const rule = CATEGORY_RULES.find((r) => r.match.some((token) => key.includes(token)));
  if (!rule) return { icon: 'catOther', color: theme.hues.slate };
  return { icon: rule.icon, color: theme.hues[rule.hue] };
}

/** Atalho para quando só o glifo importa. */
export function categoryIcon(rawName: string): IconName {
  return categoryIdentity(rawName).icon;
}

/** Atalho para quando só a cor importa. */
export function categoryColor(rawName: string): string {
  return categoryIdentity(rawName).color;
}
