// src/components/ui/Callout.tsx
//
// O bloco de destaque para dicas, avisos e explicações.
//
// Antes esse conteúdo aparecia como um card cinza com um ícone pequeno, ou como
// uma linha de texto miúdo abaixo de um botão — ou seja, com exatamente o mesmo
// peso visual do resto da tela. Uma dica que não é vista não é uma dica.
//
// O que chama atenção aqui: o selo do ícone em cor sólida (o único elemento
// saturado do bloco) e o fundo tingido com moldura no mesmo matiz, que separam
// o aviso do branco da página.
//
// Sem nada disso ser vermelho: dica não é erro.

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme, withAlpha } from '../../styles/theme';
import { Icon, type IconName } from './Icon';
import { Txt } from './Txt';

export type CalloutTone = 'tip' | 'info' | 'warning' | 'success';

const TONES: Record<CalloutTone, { color: string; icon: IconName; title: string }> = {
  tip: { color: '#B4700A', icon: 'tip', title: 'Dica' },
  info: { color: theme.brand[600], icon: 'info', title: 'Para saber' },
  warning: { color: theme.colors.warning, icon: 'warning', title: 'Atenção' },
  success: { color: theme.colors.success, icon: 'success', title: 'Tudo certo' },
};

interface Props {
  children: React.ReactNode;
  tone?: CalloutTone;
  /** Sobrescreve o título padrão do tom. Passe `null` para não exibir título. */
  title?: string | null;
  icon?: IconName;
  /** Cor própria — usada quando o destaque herda a cor de outra coisa. */
  color?: string;
  /** Versão de uma linha, sem título: para hints curtos junto de um campo. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Callout: React.FC<Props> = ({
  children,
  tone = 'tip',
  title,
  icon,
  color,
  compact = false,
  style,
}) => {
  const preset = TONES[tone];
  const accent = color ?? preset.color;
  const heading = title === undefined ? preset.title : title;

  return (
    <View
      style={[
        styles.root,
        compact && styles.rootCompact,
        {
          backgroundColor: withAlpha(accent, 0.07),
          borderColor: withAlpha(accent, 0.22),
        },
        style,
      ]}
    >
      <View style={[styles.badge, compact && styles.badgeCompact, { backgroundColor: accent }]}>
        <Icon name={icon ?? preset.icon} size={compact ? 10 : 13} color="#FFFFFF" />
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        {heading && !compact ? (
          <Txt variant="captionStrong" color={accent}>
            {heading}
          </Txt>
        ) : null}
        {typeof children === 'string' ? (
          <Txt variant={compact ? 'micro' : 'caption'} tone="muted">
            {children}
          </Txt>
        ) : (
          children
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radii.md,
    borderWidth: 1,
  },
  rootCompact: {
    alignItems: 'center',
    gap: theme.space[2],
    paddingVertical: theme.space[2],
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: theme.radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCompact: {
    width: 20,
    height: 20,
    borderRadius: theme.radii.full,
  },
});
