// src/components/ui/Surfaces.tsx
//
// Cartões, cabeçalhos de seção e o "tile" de métrica. São as caixas em que
// quase todo o conteúdo do app mora, então vale terem um só desenho.

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme, withAlpha } from '../../styles/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './Pressable';
import { Eyebrow, Txt } from './Txt';

/* ── Card ────────────────────────────────────────────────────────────────── */

export type CardVariant = 'plain' | 'elevated' | 'outlined' | 'muted' | 'brand';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'outlined',
  onPress,
  style,
  padding = theme.space[4],
  accessibilityLabel,
}) => {
  const skin: ViewStyle =
    variant === 'elevated'
      ? { backgroundColor: theme.colors.card, ...theme.shadow.md }
      : variant === 'muted'
        ? { backgroundColor: theme.colors.cardMuted }
        : variant === 'brand'
          ? { backgroundColor: theme.brand[50], borderWidth: 1, borderColor: theme.brand[100] }
          : variant === 'plain'
            ? { backgroundColor: theme.colors.card }
            : {
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.borderSubtle,
                ...theme.shadow.xs,
              };

  const composed = [{ borderRadius: theme.radii.lg, padding }, skin, style];

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        style={composed}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </PressableScale>
    );
  }
  return <View style={composed}>{children}</View>;
};

/* ── SectionHeader ───────────────────────────────────────────────────────── */

interface SectionHeaderProps {
  title: string;
  /** Ação à direita — normalmente "ver tudo". */
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  style,
}) => (
  <View style={[styles.sectionHeader, style]}>
    <View style={styles.sectionTitleWrap}>
      <View style={styles.sectionTick} />
      <Eyebrow>{title}</Eyebrow>
    </View>
    {actionLabel && onAction ? (
      <PressableScale onPress={onAction} scaleTo={0.94} style={styles.sectionAction}>
        <Txt variant="captionStrong" tone="accent">
          {actionLabel}
        </Txt>
        <Icon name="chevronRight" size={10} color={theme.colors.accent} />
      </PressableScale>
    ) : null}
  </View>
);

/* ── StatTile ────────────────────────────────────────────────────────────── */

interface StatTileProps {
  icon: IconName;
  value: string | number;
  label: string;
  /** Sobre fundo escuro (headers) o tile inverte as cores. */
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Formata a métrica para caber no tile.
 *
 * Um contador de campos passa de mil com facilidade, e "1284" ocupa o dobro da
 * largura de "247" — sem isto o número era truncado justamente quando ficava
 * interessante. A partir de mil vira "1,3k"; de um milhão, "1,2M".
 *
 * A vírgula é decimal em pt-BR: "1,3k" e não "1.3k".
 */
export function formatMetric(value: string | number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value);

  const compact = (n: number, suffix: string): string => {
    // Uma casa decimal só até 10 unidades — acima disso ela não informa nada.
    const rounded = n < 10 ? Math.round(n * 10) / 10 : Math.round(n);
    return `${String(rounded).replace('.', ',')}${suffix}`;
  };

  const abs = Math.abs(value);
  if (abs >= 1_000_000) return compact(value / 1_000_000, 'M');
  if (abs >= 1_000) return compact(value / 1_000, 'k');
  return String(value);
}

/**
 * Tamanho do número conforme o comprimento. Com o ícone dividindo a linha sobram
 * cerca de 47px para o valor — em vez de truncar, o número encolhe.
 *
 * Os degraus são conservadores de propósito: o comprimento em caracteres é uma
 * aproximação grosseira da largura real. "94%" tem os mesmos três caracteres de
 * "247" e é visivelmente mais largo, porque o "%" ocupa quase o dobro de um
 * dígito — foi exatamente aí que a primeira tabela truncou.
 */
const metricSizeFor = (text: string) => {
  if (text.length <= 2) return undefined;
  if (text.length === 3) return { fontSize: 21, lineHeight: 27 };
  if (text.length <= 5) return { fontSize: 17, lineHeight: 23 };
  return { fontSize: 14, lineHeight: 20, letterSpacing: -0.2 };
};

/**
 * As três métricas do topo da Home são a primeira coisa que o usuário lê ao
 * abrir o app — elas precisam de presença.
 *
 * A primeira versão errava por timidez: ícone de 13px dentro de uma pastilha,
 * fundo a 9% de branco e rótulo a 45% de opacidade. O conjunto sumia contra o
 * azul do header.
 *
 * O ícone divide a linha com o número, alinhado à direita: como a linha é a
 * mesma em todos os tiles, os três ícones ficam retos entre si, e não há como
 * um deles colidir com o valor.
 */
export const StatTile: React.FC<StatTileProps> = ({ icon, value, label, onDark, style }) => {
  const text = formatMetric(value);

  return (
    <View
      style={[
        styles.tile,
        onDark
          ? { backgroundColor: 'rgba(255,255,255,0.13)', borderColor: 'rgba(255,255,255,0.22)' }
          : { backgroundColor: theme.colors.card, borderColor: theme.colors.borderSubtle },
        style,
      ]}
    >
      <View style={styles.tileRow}>
        <Txt
          variant="metric"
          tone={onDark ? 'inverse' : 'default'}
          numberOfLines={1}
          style={[{ flex: 1 }, metricSizeFor(text)]}
        >
          {text}
        </Txt>
        <Icon
          name={icon}
          size={30}
          color={onDark ? withAlpha(theme.brand[300], 0.75) : withAlpha(theme.brand[500], 0.5)}
        />
      </View>
      <Txt
        variant="micro"
        color={onDark ? theme.colors.onDarkMuted : theme.colors.textLight}
        numberOfLines={1}
        style={{ fontFamily: theme.fonts.medium }}
      >
        {label}
      </Txt>
    </View>
  );
};

/** Linha de métricas — 2 a 4 tiles com a mesma largura. */
export const StatRow: React.FC<{
  items: Array<{ icon: IconName; value: string | number; label: string }>;
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ items, onDark, style }) => (
  <View style={[styles.statRow, style]}>
    {items.map((item) => (
      <StatTile key={item.label} {...item} onDark={onDark} style={{ flex: 1 }} />
    ))}
  </View>
);

/* ── Divider ─────────────────────────────────────────────────────────────── */

export const Divider: React.FC<{ style?: StyleProp<ViewStyle>; onDark?: boolean }> = ({
  style,
  onDark,
}) => (
  <View
    style={[
      { height: 1, backgroundColor: onDark ? theme.colors.hairline : theme.colors.borderSubtle },
      style,
    ]}
  />
);

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.space[3],
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
  },
  // Um traço curto na cor da marca antes do rótulo. Custa 3px e amarra a
  // hierarquia visual em todas as telas.
  sectionTick: {
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: theme.brand[500],
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
    paddingVertical: theme.space[1],
    paddingLeft: theme.space[2],
  },
  tile: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    // Proporção mais próxima do quadrado: o conteúdo é curto, então a altura
    // extra vira respiro dos dois lados em vez de um vão só em cima.
    minHeight: 92,
    justifyContent: 'center',
    gap: 1,
  },
  tileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // 6px, e não os 8 da grade: com o ícone a 30px sobram ~47px para o número,
    // e cada pixel aqui é a diferença entre "1m 12s" caber ou ser truncado.
    gap: 6,
    // Altura fixa: é ela que mantém os ícones dos três tiles na mesma linha,
    // mesmo quando um dos números encolhe por ser mais longo.
    height: 34,
  },
  statRow: {
    flexDirection: 'row',
    gap: theme.space[2],
  },
});
