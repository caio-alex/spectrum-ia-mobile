// src/screens/auth/AuthLayout.tsx
//
// Moldura compartilhada por Login e Cadastro.
//
// A logo da Spectrum é branca, então ela precisa do azul da marca por baixo —
// essa restrição virou a composição: um banner escuro com a varredura ao fundo,
// e o formulário entrando como uma folha clara presa por uma faixa em degradê. É
// a mesma costura que separa header e corpo no resto do app, o que faz o login
// já parecer "da mesma casa".
//
// Sobre a distribuição vertical: banner e folha dividem a sobra da tela, com o
// banner limitado a uma fração dela.
//
// A primeira versão dava altura fixa ao banner e flex: 1 à folha — o formulário
// grudava no topo e sobrava quase metade da tela vazia embaixo. Num celular isso
// é pior do que parece: os campos ficam fora do alcance do polegar justamente na
// tela em que o usuário só digita.
//
// Deixar o banner absorver TODA a sobra resolvia o alcance mas criava o problema
// oposto: o botão encostava no rodapé, sem respiro. Daí o teto — o banner cresce
// até a fração definida em BANNER_MAX_RATIO, e o que sobra vira espaço branco no
// fim da folha, onde não atrapalha ninguém.
//
// Com o TECLADO ABERTO a conta muda: o banner abre mão do mínimo e encolhe até o
// tamanho da logo. A marca cede espaço para a tarefa — é a única hora em que o
// usuário não está olhando para ela.

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { KeyboardAvoider, useKeyboardVisible } from '../../components/ui/Keyboard';
import { ScanGrid, SpectrumRay } from '../../components/ui/Spectrum';
import { Screen } from '../../components/ui/Screen';
import { Txt } from '../../components/ui/Txt';

/** Fração máxima da tela ocupada pelo banner. */
const BANNER_MAX_RATIO = { default: 0.5, compact: 0.34 };

/**
 * Como a sobra vertical é dividida entre banner e folha. 3:1 significa que o
 * banner fica com três quartos dela — é o que empurra o formulário para a
 * metade de baixo, no alcance do polegar. Mexer aqui é o jeito de subir ou
 * descer o formulário sem tocar em mais nada.
 */
const BANNER_GROW = 3;
const SHEET_GROW = 1;

interface Props {
  title: string;
  children: React.ReactNode;
  /** Cadastro tem mais campos: encolhe o banner para sobrar tela. */
  compact?: boolean;
}

export const AuthLayout: React.FC<Props> = ({ title, children, compact = false }) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const keyboardVisible = useKeyboardVisible();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: theme.motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  return (
    <Screen background={theme.brand[900]}>
      <KeyboardAvoider style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Em tela alta o banner cresce (até o teto) e empurra o formulário
              para baixo; em tela baixa, ou com o teclado aberto, ele para no
              mínimo e o excedente rola. */}
          <View
            style={[
              styles.banner,
              {
                // Sem piso enquanto o teclado está aberto: o banner encolhe até
                // o tamanho da logo e devolve a tela inteira ao formulário.
                minHeight: keyboardVisible ? 0 : compact ? 168 : 232,
                maxHeight: Math.round(
                  windowHeight * (compact ? BANNER_MAX_RATIO.compact : BANNER_MAX_RATIO.default),
                ),
                paddingTop: insets.top + (keyboardVisible ? theme.space[3] : theme.space[5]),
                paddingBottom: keyboardVisible ? theme.space[3] : theme.space[6],
              },
            ]}
          >
            <ScanGrid />
            <Animated.View
              style={{
                alignItems: 'center',
                opacity: enter,
                transform: [
                  { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) },
                ],
              }}
            >
              <Image
                source={require('../../../assets/spectrum-logo.png')}
                style={[styles.logo, compact && { width: 178, height: 42 }]}
                resizeMode="contain"
              />
              <Txt variant="caption" tone="inverseMuted" center style={{ marginTop: theme.space[3] }}>
                Análise competitiva automotiva
              </Txt>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.sheet,
              {
                opacity: enter,
                transform: [
                  { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
                ],
              },
            ]}
          >
            <SpectrumRay height={4} />
            <View style={[styles.sheetBody, { paddingBottom: insets.bottom + theme.space[7] }]}>
              <Txt variant="title1" style={{ marginBottom: theme.space[5] }}>
                {title}
              </Txt>
              {children}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoider>
    </Screen>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  banner: {
    // Cresce com a tela até o teto de BANNER_MAX_RATIO, mas NUNCA encolhe.
    // `flex: 1` não serve aqui: ele traz flexShrink: 1 junto, e em tela baixa os
    // dois blocos se comprimiam para caber — com overflow: hidden na folha, o
    // link do rodapé era cortado em vez de a tela rolar.
    flexGrow: BANNER_GROW,
    flexShrink: 0,
    flexBasis: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.space[6],
    overflow: 'hidden',
  },
  logo: {
    width: 232,
    height: 55,
  },
  sheet: {
    // Também cresce: a sobra que o banner não pega vira espaço no fim da folha.
    flexGrow: SHEET_GROW,
    flexShrink: 0,
    flexBasis: 'auto',
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radii.xxl,
    borderTopRightRadius: theme.radii.xxl,
    overflow: 'hidden',
    ...theme.shadow.lg,
  },
  sheetBody: {
    paddingHorizontal: theme.space[6],
    paddingTop: theme.space[6],
  },
});
