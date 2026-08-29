// src/components/ui/Button.tsx
//
// Um botão só, com variantes. Antes cada tela redesenhava o seu (alturas,
// raios e pesos diferentes em cada arquivo de estilo), o que é a forma mais
// rápida de um produto parecer montado por partes.

import React from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './Pressable';
import { Txt } from './Txt';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'ghost'
  | 'onDark'
  | 'danger'
  | 'dangerSolid';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** Lado do ícone. `trailing` para setas de avanço. */
  iconPosition?: 'leading' | 'trailing';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZES: Record<ButtonSize, { height: number; padH: number; gap: number; icon: number }> = {
  sm: { height: 38, padH: 14, gap: 7, icon: 13 },
  md: { height: 50, padH: 20, gap: 9, icon: 15 },
  lg: { height: 58, padH: 24, gap: 10, icon: 16 },
};

interface Skin {
  bg: string;
  fg: string;
  border?: string;
  shadow?: object;
}

const SKINS: Record<ButtonVariant, Skin> = {
  primary: { bg: theme.brand[800], fg: '#FFFFFF', shadow: theme.shadow.brand },
  // Azure — o segundo azul da rampa. Serve para ações que são importantes mas
  // não são "o" próximo passo do fluxo (comparar, por exemplo): destacam-se sem
  // disputar com o CTA principal, que é sempre o azul-marinho da marca.
  accent: { bg: theme.brand[500], fg: '#FFFFFF', shadow: theme.shadow.accent },
  secondary: { bg: theme.brand[50], fg: theme.brand[700], border: theme.brand[100] },
  ghost: { bg: 'transparent', fg: theme.brand[700] },
  onDark: { bg: 'rgba(255,255,255,0.12)', fg: '#FFFFFF', border: 'rgba(255,255,255,0.22)' },
  // `danger` é o ponto de entrada (fica bem numa lista de opções);
  // `dangerSolid` é a confirmação em si, onde o peso visual é proposital.
  danger: { bg: theme.colors.dangerBg, fg: theme.colors.danger, border: '#F6C9C5' },
  dangerSolid: { bg: theme.colors.danger, fg: '#FFFFFF', shadow: theme.shadow.danger },
};

export const Button: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'leading',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
}) => {
  const dims = SIZES[size];
  const skin = SKINS[variant];
  const isOff = disabled || loading;

  const bg = isOff
    ? variant === 'primary' || variant === 'accent' || variant === 'dangerSolid'
      ? theme.ink[100]
      : theme.ink[50]
    : skin.bg;
  const fg = isOff ? theme.ink[400] : skin.fg;

  const content = (
    <>
      {icon && iconPosition === 'leading' && !loading ? (
        <Icon name={icon} size={dims.icon} color={fg} />
      ) : null}
      <Txt
        variant={size === 'sm' ? 'captionStrong' : 'bodyStrong'}
        color={fg}
        numberOfLines={1}
        style={size === 'lg' ? { fontFamily: theme.fonts.bold, fontSize: 16 } : undefined}
      >
        {label}
      </Txt>
      {icon && iconPosition === 'trailing' && !loading ? (
        <Icon name={icon} size={dims.icon} color={fg} />
      ) : null}
    </>
  );

  return (
    <PressableScale
      onPress={onPress}
      disabled={isOff}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isOff, busy: loading }}
      style={[
        styles.base,
        {
          height: dims.height,
          paddingHorizontal: dims.padH,
          gap: dims.gap,
          backgroundColor: bg,
          borderRadius: theme.radii.md,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        skin.border && !isOff ? { borderWidth: 1, borderColor: skin.border } : null,
        !isOff && skin.shadow ? skin.shadow : null,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.base}>
          <ActivityIndicator size="small" color={fg} />
        </View>
      ) : (
        content
      )}
    </PressableScale>
  );
};

/** Botão circular só de ícone — usado nos headers e como ação secundária. */
export const IconButton: React.FC<{
  icon: IconName;
  onPress?: () => void;
  size?: number;
  variant?: 'onDark' | 'soft' | 'plain';
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}> = ({ icon, onPress, size = 40, variant = 'onDark', accessibilityLabel, style }) => {
  const skin =
    variant === 'onDark'
      ? { bg: 'rgba(255,255,255,0.13)', fg: '#FFFFFF', border: 'rgba(255,255,255,0.18)' }
      : variant === 'soft'
        ? { bg: theme.brand[50], fg: theme.brand[700], border: theme.brand[100] }
        : { bg: 'transparent', fg: theme.colors.textLight, border: 'transparent' };

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      scaleTo={0.9}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: theme.radii.full,
          backgroundColor: skin.bg,
          borderWidth: 1,
          borderColor: skin.border,
        },
        style,
      ]}
    >
      <Icon name={icon} size={size * 0.42} color={skin.fg} />
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
