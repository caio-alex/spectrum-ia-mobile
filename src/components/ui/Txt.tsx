// src/components/ui/Txt.tsx
//
// Todo texto do app passa por aqui. O motivo é concreto: a Sora estava sendo
// carregada mas nunca aplicada — cada `<Text>` caía na fonte do sistema, o que
// dava um app diferente no iOS, no Android e na web. Com um único componente,
// a família certa (e o peso certo, via família e não via fontWeight sintético)
// vem de graça em toda a interface.

import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { theme } from '../../styles/theme';

export type TxtVariant = keyof typeof theme.type;

export type TxtTone =
  | 'default'
  | 'muted'
  | 'faint'
  | 'brand'
  | 'accent'
  | 'inverse'
  | 'inverseMuted'
  | 'inverseFaint'
  | 'success'
  | 'warning'
  | 'danger';

const TONES: Record<TxtTone, string> = {
  default: theme.colors.text,
  muted: theme.colors.textLight,
  faint: theme.colors.textMuted,
  brand: theme.colors.primary,
  accent: theme.colors.accent,
  inverse: theme.colors.onDark,
  inverseMuted: theme.colors.onDarkMuted,
  inverseFaint: theme.colors.onDarkFaint,
  success: theme.colors.success,
  warning: theme.colors.warning,
  danger: theme.colors.danger,
};

export interface TxtProps extends TextProps {
  variant?: TxtVariant;
  tone?: TxtTone;
  /** Caixa alta com o espaçamento da sobrancelha de seção. */
  uppercase?: boolean;
  center?: boolean;
  color?: string;
}

export const Txt: React.FC<TxtProps> = ({
  variant = 'body',
  tone = 'default',
  uppercase,
  center,
  color,
  style,
  ...rest
}) => {
  const base = theme.type[variant] as TextStyle;
  return (
    <Text
      {...rest}
      style={[
        base,
        { color: color ?? TONES[tone] },
        uppercase && { textTransform: 'uppercase' as const },
        center && { textAlign: 'center' as const },
        style,
      ]}
    />
  );
};

/** Sobrancelha de seção — o rótulo curto em caixa alta que abre cada bloco. */
export const Eyebrow: React.FC<Omit<TxtProps, 'variant' | 'uppercase'>> = (props) => (
  <Txt variant="label" tone="muted" uppercase {...props} />
);
