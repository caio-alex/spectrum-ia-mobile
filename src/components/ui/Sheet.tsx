// src/components/ui/Sheet.tsx
//
// Bottom sheet único para o app inteiro. Antes havia três implementações
// diferentes (exportação, seletor de sessão, seletor de marca/modelo), cada uma
// com sua animação, seu arrasto e seu cantinho — o usuário sentia isso mesmo
// sem saber nomear.
//
// Detalhes que valem o código:
//
//   • O modal continua montado durante a animação de saída — senão o RN some
//     com ele sem animar.
//   • O arrasto só assume o gesto em movimento vertical para baixo, para não
//     roubar toques da lista interna.
//   • A altura máxima é calculada em PIXELS, não em porcentagem. O envoltório
//     do teclado não tem altura própria, então um `maxHeight: '95%'` não tinha
//     contra o que resolver: o conteúdo vazava para fora da caixa e o último
//     botão do formulário ficava cortado na borda de baixo da tela.
//   • O respiro inferior tem piso. `useSafeAreaInsets` dentro de um Modal
//     costuma devolver zero, e sem o piso o botão encostava na barra de gestos.

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { Txt } from './Txt';

const OFFSET = 560;
const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.85;

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Bloqueia o arrasto e o toque no véu (ex.: durante um download). */
  locked?: boolean;
  /** Altura máxima como fração da tela. */
  maxHeightRatio?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Levanta o sheet com o teclado — para sheets com formulário. */
  avoidKeyboard?: boolean;
}

export const Sheet: React.FC<Props> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  locked = false,
  maxHeightRatio = 0.85,
  contentStyle,
  avoidKeyboard = false,
}) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(OFFSET)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(OFFSET);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          ...theme.motion.spring,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: theme.motion.base,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: OFFSET,
          duration: theme.motion.fast + 40,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: theme.motion.fast,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Refs porque o PanResponder é criado uma única vez e não veria props novas.
  const lockedRef = useRef(locked);
  lockedRef.current = locked;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const springBack = () =>
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 3 }).start();

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_e, g) =>
        !lockedRef.current && g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) onCloseRef.current();
        else springBack();
      },
      onPanResponderTerminate: springBack,
    }),
  ).current;

  const body = (
    <Animated.View
      style={[
        styles.sheet,
        {
          paddingBottom: Math.max(insets.bottom, theme.space[3]) + theme.space[4],
          maxHeight: Math.round(windowHeight * maxHeightRatio),
          transform: [{ translateY }],
        },
        contentStyle,
      ]}
    >
      <View {...pan.panHandlers} style={styles.grabArea}>
        <View style={styles.handle} />
        {title ? (
          <Txt variant="title2" style={{ marginTop: theme.space[2] }}>
            {title}
          </Txt>
        ) : null}
        {subtitle ? (
          <Txt variant="caption" tone="muted" style={{ marginTop: 4 }}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {children}
    </Animated.View>
  );

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { opacity: backdrop }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={locked ? undefined : onClose}
            accessibilityLabel="Fechar"
          />
        </Animated.View>
        {avoidKeyboard ? (
          <KeyboardAvoidingView
            style={styles.keyboardWrap}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {body}
          </KeyboardAvoidingView>
        ) : (
          body
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.scrim },
  // flex: 1 é o que dá altura ao envoltório — sem isso o sheet não tem contra
  // o que se medir e a altura máxima vira letra morta.
  keyboardWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radii.xxl,
    borderTopRightRadius: theme.radii.xxl,
    paddingHorizontal: theme.space[5],
    paddingTop: theme.space[2],
    ...theme.shadow.lg,
  },
  grabArea: {
    paddingBottom: theme.space[4],
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.ink[200],
    alignSelf: 'center',
    marginBottom: theme.space[1],
  },
});
