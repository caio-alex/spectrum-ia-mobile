// src/styles/theme.ts
// ─────────────────────────────────────────────────────────────────────────────
// SPECTRUM — DESIGN SYSTEM
//
// A marca nasce de uma ideia simples: a IA varre um *espectro* de fontes e
// converge tudo num dado só. Três elementos carregam essa ideia na interface:
//
//   1. SPECTRUM RAY   — faixa em degradê (azul-marca → azure → sky → aqua).
//                       Aparece na costura dos headers, nas barras de progresso
//                       e no indicador da navegação. É a assinatura visual.
//   2. SCAN GRID      — malha e arcos discretos nos headers escuros, evocando
//                       varredura e captura de dados.
//   3. CONFIANÇA COMO LUZ — a procedência de cada campo (Oficial / Review /
//                       Estimado) é lida como intensidade, não como alarme.
//
// O azul #001881 é o ponto fixo da marca; toda a rampa foi construída a partir
// dele. As chaves antigas (colors.primary, radii.md, …) continuam válidas para
// não quebrar nada que ainda não foi migrado.
// ─────────────────────────────────────────────────────────────────────────────

/* ── Rampa da marca ──────────────────────────────────────────────────────── */
const brand = {
  50: '#F0F5FF',
  100: '#DCE8FF',
  200: '#B9CFFF',
  300: '#83C0FF', // sky — segundo tom oficial da marca
  400: '#5C85FF',
  500: '#2E5BF0', // azure — o azul "interativo" sobre fundo claro
  600: '#1A3ED1',
  700: '#0A28A8',
  800: '#001881', // ★ AZUL SPECTRUM — ponto fixo da identidade
  900: '#00114F',
  950: '#000A2E',
} as const;

/* Aqua: a ponta clara do espectro. Usada com parcimônia — é o brilho da marca. */
const aqua = {
  400: '#5CF0E4',
  500: '#2CE5D5',
  600: '#0FBFB1',
} as const;

/* ── Neutros (levemente azulados, para casar com o azul da marca) ────────── */
const ink = {
  0: '#FFFFFF',
  25: '#FAFBFE',
  50: '#F2F5FC',
  100: '#E7ECF7',
  200: '#D2DAEC',
  300: '#AEB8D2',
  400: '#8791AF',
  500: '#646E8D',
  600: '#4A5372',
  700: '#343C57',
  800: '#1F253A',
  900: '#0E1324',
} as const;

/* ── Semânticos ──────────────────────────────────────────────────────────── */
const semantic = {
  success: '#0E9F6E',
  successBg: '#E4F7F0',
  successBorder: '#B9E8D8',

  warning: '#B45309',
  warningBg: '#FDF3E4',
  warningBorder: '#F3DFBE',

  danger: '#D92D20',
  dangerBg: '#FDECEA',
  dangerBorder: '#F6C9C5',

  info: brand[500],
  infoBg: brand[50],
  infoBorder: brand[100],
} as const;

/**
 * Procedência do dado. Deliberadamente NÃO usamos vermelho para "Estimado":
 * um dado inferido não é um erro, é um dado com menos lastro. Vermelho aqui
 * treinaria o usuário a ignorar os alertas de verdade.
 */
const confidence = {
  official: {
    fg: '#0B7A55',
    bg: '#E4F7F0',
    border: '#B9E8D8',
    dot: semantic.success,
    label: 'Oficial',
  },
  review: {
    fg: brand[700],
    bg: brand[50],
    border: brand[100],
    dot: brand[500],
    label: 'Review',
  },
  estimated: {
    fg: '#8F4308',
    bg: '#FDF3E4',
    border: '#F3DFBE',
    dot: semantic.warning,
    label: 'Estimado',
  },
} as const;

/* ── Matizes das categorias ──────────────────────────────────────────────── */

/**
 * Converte `#RRGGBB` em `rgba(...)`. Serve para derivar o fundo e o anel de uma
 * cor sólida sem precisar escrever três variações de cada matiz à mão — e
 * garante que todas as categorias tenham exatamente a mesma intensidade.
 */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Sobe a luminosidade de uma cor, preservando matiz e saturação.
 *
 * Os matizes das categorias foram calibrados para fundo claro, onde precisam ser
 * escuros o bastante para o texto ao lado ter contraste. Sobre o azul-marinho da
 * tela de processamento acontece o inverso: `graphite` e `indigo` somem. Em vez
 * de manter uma segunda paleta (que sairia do compasso na primeira alteração),
 * derivamos a versão clara da mesma cor.
 *
 * Misturar com branco resolveria o contraste mas lavaria a cor — o laranja de
 * "Motor" viraria salmão e deixaria de ser reconhecível como a mesma categoria.
 * Por isso o ajuste é em HSL, mexendo só no L.
 */
export function liftForDark(hex: string, targetL = 0.66): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let sat = 0;
  if (max !== min) {
    const d = max - min;
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  const targetLightness = Math.max(l, targetL);

  const hueToChannel = (p1: number, q1: number, t0: number): number => {
    let t = t0;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p1 + (q1 - p1) * 6 * t;
    if (t < 1 / 2) return q1;
    if (t < 2 / 3) return p1 + (q1 - p1) * (2 / 3 - t) * 6;
    return p1;
  };

  let outR = targetLightness;
  let outG = targetLightness;
  let outB = targetLightness;
  if (sat !== 0) {
    const q =
      targetLightness < 0.5
        ? targetLightness * (1 + sat)
        : targetLightness + sat - targetLightness * sat;
    const p2 = 2 * targetLightness - q;
    outR = hueToChannel(p2, q, h + 1 / 3);
    outG = hueToChannel(p2, q, h);
    outB = hueToChannel(p2, q, h - 1 / 3);
  }

  const channel = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${channel(outR)}${channel(outG)}${channel(outB)}`;
}

/**
 * Uma cor por categoria de pesquisa.
 *
 * O azul continua sendo o dono da interface — ele está em toda a moldura
 * (headers, botões, navegação). Estas cores vivem só *dentro* do conteúdo, nos
 * ícones de categoria, onde a monocromia atrapalhava: com 14 blocos idênticos
 * em azul, escolher virava leitura de texto em vez de reconhecimento visual.
 *
 * Todas têm luminosidade parecida e saturação contida, para o conjunto ler como
 * uma paleta e não como um saco de cores.
 */
const hues = {
  ember: '#D9480F',
  clay: '#96591F',
  amber: '#C07C00',
  /** Amarelo-ouro do Teto Solar — o sol, e não mais o mesmo âmbar da Iluminação. */
  sun: '#C79A00',
  /** Azul-petróleo dos Bancos: um tom frio no meio do bloco quente da grade. */
  petrol: '#1C6E8C',
  olive: '#5F7C2E',
  green: '#0E9F6E',
  teal: '#0F8A7A',
  cyan: '#0E8FA8',
  azure: brand[500],
  indigo: '#3B4CB8',
  violet: '#6D3FD4',
  magenta: '#C81E78',
  rose: '#B33A63',
  graphite: '#4A5372',
  slate: '#64748B',
} as const;

export type Hue = keyof typeof hues;

/* ── Tipografia — Sora, a voz da marca ───────────────────────────────────── */
const fonts = {
  light: 'Sora_300Light',
  regular: 'Sora_400Regular',
  medium: 'Sora_500Medium',
  semibold: 'Sora_600SemiBold',
  bold: 'Sora_700Bold',
  extrabold: 'Sora_800ExtraBold',
} as const;

/**
 * Escala tipográfica. `fontWeight` fica de fora de propósito: no Android o peso
 * sintético sobre uma fonte custom vira uma bagunça — o peso vem sempre da
 * própria família (`fontFamily`).
 */
const type = {
  display: { fontFamily: fonts.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  title1: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 31, letterSpacing: -0.5 },
  title2: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 26, letterSpacing: -0.3 },
  title3: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  captionStrong: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, letterSpacing: 0 },
  micro: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 15, letterSpacing: 0.1 },
  /** Sobrancelha de seção — caixa alta, muito espaçada. Marca registrada. */
  label: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2 },
  /** Números grandes (métricas, contadores). */
  metric: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 31, letterSpacing: -0.8 },
} as const;

/* ── Espaçamento (grade de 4pt) ──────────────────────────────────────────── */
const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 32,
  8: 40,
  9: 48,
  10: 64,
} as const;

/* ── Raios ───────────────────────────────────────────────────────────────── */
const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

/* ── Elevação ────────────────────────────────────────────────────────────── */
const shadow = {
  none: { boxShadow: 'none' },
  xs: { boxShadow: '0px 1px 2px rgba(14, 19, 36, 0.06)' },
  sm: { boxShadow: '0px 2px 8px rgba(14, 19, 36, 0.06)' },
  md: { boxShadow: '0px 6px 18px rgba(14, 19, 36, 0.10)' },
  lg: { boxShadow: '0px 14px 34px rgba(14, 19, 36, 0.14)' },
  /** Sombra colorida — só para superfícies que pertencem à marca (CTA, FAB). */
  brand: { boxShadow: '0px 8px 22px rgba(0, 24, 129, 0.32)' },
  brandLg: { boxShadow: '0px 14px 34px rgba(0, 24, 129, 0.40)' },
  /** Par da variante `accent` de botão. */
  accent: { boxShadow: '0px 8px 22px rgba(46, 91, 240, 0.34)' },
  /** Par da variante `dangerSolid`. */
  danger: { boxShadow: '0px 8px 22px rgba(217, 45, 32, 0.28)' },
} as const;

/* ── Movimento ───────────────────────────────────────────────────────────── */
const motion = {
  instant: 90,
  fast: 150,
  base: 240,
  slow: 380,
  /** Atraso entre itens de uma mesma lista, para a entrada escalonada. */
  stagger: 45,
  spring: { tension: 70, friction: 11 },
  springSoft: { tension: 55, friction: 12 },
} as const;

/* ── O espectro ──────────────────────────────────────────────────────────── */
const spectrum = {
  /** Paradas do degradê assinatura, do marinho ao aqua. */
  stops: [brand[800], brand[600], brand[500], brand[300], aqua[500]] as string[],
  /** Versão curta, para traços finos. */
  stopsShort: [brand[600], brand[400], brand[300], aqua[500]] as string[],
};

export const theme = {
  brand,
  aqua,
  ink,
  hues,
  confidence,
  spectrum,
  type,
  fonts,
  space,
  radii,
  shadow,
  motion,

  colors: {
    /* — chaves originais, preservadas — */
    primary: brand[800],
    secondary: brand[300],
    background: ink[0],
    surface: ink[50],
    surfaceHover: ink[100],
    text: ink[900],
    textLight: ink[500],
    textMuted: ink[400],
    success: semantic.success,
    successBg: semantic.successBg,
    warning: semantic.warning,
    warningBg: semantic.warningBg,
    border: ink[100],
    borderStrong: ink[300],
    primaryAlpha08: 'rgba(0,24,129,0.08)',
    primaryAlpha15: 'rgba(0,24,129,0.15)',
    secondaryAlpha15: 'rgba(131,192,255,0.15)',
    secondaryAlpha35: 'rgba(131,192,255,0.35)',

    /* — novas — */
    accent: brand[500],
    accentSoft: brand[50],
    aqua: aqua[500],
    danger: semantic.danger,
    dangerBg: semantic.dangerBg,
    info: semantic.info,
    infoBg: semantic.infoBg,

    /** Superfícies */
    canvas: ink[25],
    card: ink[0],
    cardMuted: ink[50],
    borderSubtle: ink[100],

    /** Texto sobre fundo escuro */
    onDark: '#FFFFFF',
    onDarkMuted: 'rgba(255,255,255,0.72)',
    onDarkFaint: 'rgba(255,255,255,0.45)',

    /** Véus */
    scrim: 'rgba(6, 12, 34, 0.55)',
    hairline: 'rgba(255,255,255,0.10)',
  },
};

export type Theme = typeof theme;
export type ConfidenceKey = keyof typeof confidence;
