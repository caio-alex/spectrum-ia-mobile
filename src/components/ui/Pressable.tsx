// src/components/ui/Pressable.tsx
//
// Toque com resposta física. `TouchableOpacity` só apaga o elemento; um leve
// recuo de escala comunica melhor "eu registrei seu toque" e é o que diferencia
// uma interface que parece viva de uma que parece um formulário.
//
// O `style` vai no PRÓPRIO Pressable (via createAnimatedComponent), não num
// View interno. Com o View interno, um `flex: 1` nunca chegava ao nó que o
// layout do pai enxerga: os filhos ficavam do tamanho do conteúdo em vez de
// dividirem a linha — era o que amontoava as abas da barra inferior e deixava
// os cards de categoria com larguras irregulares.

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
import { theme } from '../../styles/theme';

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Escala no estado pressionado. 1 desliga o efeito. */
  scaleTo?: number;
  /** Opacidade no estado pressionado. */
  dimTo?: number;
  children?: React.ReactNode;
}

export const PressableScale: React.FC<PressableScaleProps> = ({
  style,
  scaleTo = 0.97,
  dimTo = 0.92,
  disabled,
  children,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animate = useCallback(
    (toScale: number, toOpacity: number) => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: toScale,
          useNativeDriver: true,
          speed: 40,
          bounciness: 4,
        }),
        Animated.timing(opacity, {
          toValue: toOpacity,
          duration: theme.motion.instant,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [scale, opacity],
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) animate(scaleTo, dimTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animate(1, 1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }], opacity }]}
    >
      {children}
    </AnimatedPressable>
  );
};
