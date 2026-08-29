// src/components/ui/Feedback.tsx
//
// Vazio, carregando e erro — os três estados que decidem a percepção de
// qualidade de um app e que costumam ser os últimos a receber atenção.
//
// Trocamos o spinner solto por *skeletons*: o usuário já vê a forma do que vai
// chegar, o que reduz a sensação de espera mesmo com a mesma latência.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { BrandMark } from './Spectrum';
import { Txt } from './Txt';

/* ── Skeleton ────────────────────────────────────────────────────────────── */

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 12,
  radius = theme.radii.xs,
  style,
}) => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 780,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 780,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius: radius,
          backgroundColor: theme.ink[100],
          opacity,
        },
        style,
      ]}
    />
  );
};

/** Esqueleto de um card de lista (ícone + duas linhas + rodapé). */
export const SkeletonCard: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => (
  <View style={[styles.skelCard, style]}>
    <Skeleton width={44} height={44} radius={theme.radii.md} />
    <View style={{ flex: 1, gap: 8 }}>
      <Skeleton width="72%" height={13} />
      <Skeleton width="45%" height={10} />
      <Skeleton width="30%" height={10} />
    </View>
  </View>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <View style={{ gap: theme.space[2] }}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

/* ── EmptyState ──────────────────────────────────────────────────────────── */

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  /** Usa o glifo da marca em vez de um ícone — para vazios "de primeira vez". */
  brandMark?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'sessions',
  brandMark,
  actionLabel,
  onAction,
  style,
}) => (
  <View style={[styles.state, style]}>
    <View style={styles.stateIcon}>
      {brandMark ? (
        <BrandMark size={34} variant="gradient" />
      ) : (
        <Icon name={icon} size={20} color={theme.brand[500]} />
      )}
    </View>
    <Txt variant="title3" center>
      {title}
    </Txt>
    {description ? (
      <Txt variant="caption" tone="muted" center style={{ maxWidth: 280 }}>
        {description}
      </Txt>
    ) : null}
    {actionLabel && onAction ? (
      <Button
        label={actionLabel}
        onPress={onAction}
        variant="secondary"
        size="sm"
        fullWidth={false}
        style={{ marginTop: theme.space[2] }}
      />
    ) : null}
  </View>
);

/* ── ErrorState ──────────────────────────────────────────────────────────── */

export const ErrorState: React.FC<{
  title?: string;
  description: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}> = ({ title = 'Algo não carregou', description, onRetry, style }) => (
  <View style={[styles.state, style]}>
    <View style={[styles.stateIcon, { backgroundColor: theme.colors.dangerBg }]}>
      <Icon name="error" size={20} color={theme.colors.danger} />
    </View>
    <Txt variant="title3" center>
      {title}
    </Txt>
    <Txt variant="caption" tone="muted" center style={{ maxWidth: 300 }}>
      {description}
    </Txt>
    {onRetry ? (
      <Button
        label="Tentar novamente"
        icon="retry"
        onPress={onRetry}
        variant="secondary"
        size="sm"
        fullWidth={false}
        style={{ marginTop: theme.space[2] }}
      />
    ) : null}
  </View>
);

/* ── Mensagem inline de erro (formulários) ───────────────────────────────── */

export const FormError: React.FC<{ message?: string | null; onDark?: boolean }> = ({
  message,
  onDark,
}) => {
  if (!message) return null;
  return (
    <View
      style={[
        styles.formError,
        onDark
          ? { backgroundColor: 'rgba(217,45,32,0.18)', borderColor: 'rgba(255,180,174,0.35)' }
          : { backgroundColor: theme.colors.dangerBg, borderColor: '#F6C9C5' },
      ]}
    >
      <Icon name="warning" size={12} color={onDark ? '#FFC9C4' : theme.colors.danger} />
      <Txt variant="caption" color={onDark ? '#FFD9D6' : theme.colors.danger} style={{ flex: 1 }}>
        {message}
      </Txt>
    </View>
  );
};

const styles = StyleSheet.create({
  skelCard: {
    flexDirection: 'row',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  state: {
    alignItems: 'center',
    gap: theme.space[2],
    paddingVertical: theme.space[7],
    paddingHorizontal: theme.space[5],
  },
  stateIcon: {
    width: 60,
    height: 60,
    borderRadius: theme.radii.xl,
    backgroundColor: theme.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.space[1],
  },
  formError: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[2],
    padding: theme.space[3],
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    marginBottom: theme.space[3],
  },
});
