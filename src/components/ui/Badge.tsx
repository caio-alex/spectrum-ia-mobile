// src/components/ui/Badge.tsx
//
// Selos e o indicador de procedência do dado.
//
// A procedência é a informação mais importante da tela de resultado: sem ela o
// usuário não sabe se pode colar aquele número num material comercial. Por isso
// ela ganha um componente próprio, com três leituras possíveis — texto (badge),
// intensidade (barras) e ponto (na tabela densa).

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme, type ConfidenceKey } from '../../styles/theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

/* ── Badge genérico ──────────────────────────────────────────────────────── */

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'onDark';

const TONES: Record<BadgeTone, { bg: string; fg: string; border: string }> = {
  neutral: { bg: theme.ink[50], fg: theme.ink[600], border: theme.ink[100] },
  brand: { bg: theme.brand[50], fg: theme.brand[700], border: theme.brand[100] },
  success: { bg: theme.colors.successBg, fg: '#0B7A55', border: '#B9E8D8' },
  warning: { bg: theme.colors.warningBg, fg: '#8F4308', border: '#F3DFBE' },
  danger: { bg: theme.colors.dangerBg, fg: theme.colors.danger, border: '#F6C9C5' },
  onDark: { bg: 'rgba(255,255,255,0.14)', fg: '#FFFFFF', border: 'rgba(255,255,255,0.18)' },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  tone = 'neutral',
  icon,
  size = 'md',
  style,
}) => {
  const skin = TONES[tone];
  const compact = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: skin.bg,
          borderColor: skin.border,
          paddingHorizontal: compact ? 7 : 9,
          paddingVertical: compact ? 2 : 4,
          gap: compact ? 4 : 5,
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={compact ? 9 : 10} color={skin.fg} /> : null}
      <Txt
        variant="micro"
        color={skin.fg}
        style={{ fontFamily: theme.fonts.semibold, fontSize: compact ? 10 : 11 }}
        numberOfLines={1}
      >
        {label}
      </Txt>
    </View>
  );
};

/* ── Procedência ─────────────────────────────────────────────────────────── */

/** Traduz o enum do backend (e as variantes legadas) para a chave do tema. */
export function toConfidenceKey(raw: string | null | undefined): ConfidenceKey {
  const value = (raw ?? '').toUpperCase();
  if (value === 'OFFICIAL' || value === 'OFICIAL' || value === 'HIGH') return 'official';
  if (value === 'REVIEW' || value === 'MEDIUM') return 'review';
  return 'estimated';
}

const CONFIDENCE_ICON: Record<ConfidenceKey, IconName> = {
  official: 'success',
  review: 'sources',
  estimated: 'ai',
};

export const ConfidenceBadge: React.FC<{
  level: ConfidenceKey;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}> = ({ level, size = 'md', style }) => {
  const skin = theme.confidence[level];
  const compact = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: skin.bg,
          borderColor: skin.border,
          paddingHorizontal: compact ? 7 : 9,
          paddingVertical: compact ? 2 : 4,
          gap: compact ? 4 : 5,
        },
        style,
      ]}
    >
      <Icon name={CONFIDENCE_ICON[level]} size={compact ? 9 : 10} color={skin.fg} />
      <Txt
        variant="micro"
        color={skin.fg}
        style={{ fontFamily: theme.fonts.semibold, fontSize: compact ? 10 : 11 }}
      >
        {skin.label}
      </Txt>
    </View>
  );
};

/**
 * Três barrinhas de altura crescente: cheias = Oficial, duas = Review, uma =
 * Estimado. Lê-se de relance numa tabela densa, sem ocupar largura de texto.
 */
export const ConfidenceBars: React.FC<{ level: ConfidenceKey; style?: StyleProp<ViewStyle> }> = ({
  level,
  style,
}) => {
  const filled = level === 'official' ? 3 : level === 'review' ? 2 : 1;
  const color = theme.confidence[level].dot;
  return (
    <View style={[styles.bars, style]} accessibilityLabel={`Procedência: ${theme.confidence[level].label}`}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={{
            width: 3,
            height: 5 + i * 3,
            borderRadius: 2,
            backgroundColor: i < filled ? color : theme.ink[200],
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 11,
  },
});
