// src/components/ui/Screen.tsx
//
// O esqueleto que dá a mesma silhueta a todas as telas:
//
//   ┌───────────────────────────────┐
//   │  header azul + scan grid      │  ← a marca vive aqui
//   ├───────────────────────────────┤  ← SPECTRUM RAY (a costura)
//   │  corpo claro                  │
//   └───────────────────────────────┘
//
// A costura em degradê no lugar do costumeiro "sheet de cantos arredondados" é
// deliberada: são 2px que aparecem em toda tela e viram a assinatura do app.

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { IconButton } from './Button';
import type { IconName } from './Icon';
import { ScanGrid, SpectrumRay } from './Spectrum';
import { Eyebrow, Txt } from './Txt';

/* ── Screen ──────────────────────────────────────────────────────────────── */

export const Screen: React.FC<{
  children: React.ReactNode;
  /** Cor do corpo. `canvas` (padrão) é o branco levemente azulado. */
  background?: string;
  style?: StyleProp<ViewStyle>;
}> = ({ children, background = theme.colors.canvas, style }) => (
  // A status bar é configurada uma única vez no App (expo-status-bar): o topo
  // de toda tela é o azul da marca, então o conteúdo dela é sempre claro.
  <View style={[{ flex: 1, backgroundColor: background }, style]}>{children}</View>
);

/** Área inferior segura (gestos do iOS / barra do Android). */
export const BottomInset: React.FC<{ extra?: number }> = ({ extra = 0 }) => {
  const insets = useSafeAreaInsets();
  return <View style={{ height: insets.bottom + extra }} />;
};

/* ── ScreenHeader ────────────────────────────────────────────────────────── */

interface ScreenHeaderProps {
  /** Rótulo curto em caixa alta acima do título. */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backIcon?: IconName;
  backLabel?: string;
  /** Botões à direita da barra superior. */
  actions?: React.ReactNode;
  /** Conteúdo extra dentro da área escura (métricas, abas, busca…). */
  children?: React.ReactNode;
  /** Slot à esquerda substituindo o botão de voltar (logo, avatar…). */
  leading?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Remove a costura em degradê — só para quando o corpo também é escuro. */
  seam?: boolean;
  compact?: boolean;
  /**
   * Espaço entre a barra superior e o que vem abaixo dela. `0` encosta o
   * conteúdo na linha onde a barra termina — é o que a Home usa para a logo
   * começar exatamente onde o nome do usuário acaba.
   */
  barGap?: number;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  onBack,
  backIcon = 'back',
  backLabel,
  actions,
  children,
  leading,
  style,
  seam = true,
  compact = false,
  barGap = theme.space[4],
}) => {
  const insets = useSafeAreaInsets();
  const hasBar = !!onBack || !!actions || !!leading;

  return (
    <View style={[styles.header, style]}>
      <ScanGrid />
      <View
        style={{
          paddingTop: insets.top + (compact ? theme.space[2] : theme.space[3]),
          paddingHorizontal: theme.space[4],
          paddingBottom: compact ? theme.space[4] : theme.space[5],
        }}
      >
        {hasBar ? (
          <View style={[styles.bar, { marginBottom: barGap }]}>
            <View style={styles.barLeft}>
              {leading}
              {onBack ? (
                <IconButton
                  icon={backIcon}
                  onPress={onBack}
                  size={38}
                  accessibilityLabel={backLabel ?? 'Voltar'}
                />
              ) : null}
              {backLabel && onBack ? (
                <Txt variant="captionStrong" tone="inverseMuted" numberOfLines={1} style={{ flex: 1 }}>
                  {backLabel}
                </Txt>
              ) : null}
            </View>
            {actions ? <View style={styles.barRight}>{actions}</View> : null}
          </View>
        ) : null}

        {eyebrow ? (
          <Eyebrow tone="inverseFaint" style={{ marginBottom: 6 }}>
            {eyebrow}
          </Eyebrow>
        ) : null}
        {title ? (
          <Txt variant={compact ? 'title2' : 'title1'} tone="inverse">
            {title}
          </Txt>
        ) : null}
        {subtitle ? (
          <Txt variant="caption" tone="inverseMuted" style={{ marginTop: 4 }}>
            {subtitle}
          </Txt>
        ) : null}

        {children}
      </View>
      {seam ? <SpectrumRay height={2} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.brand[900],
    overflow: 'hidden',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 38,
  },
  barLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    flex: 1,
  },
  barRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
  },
});
