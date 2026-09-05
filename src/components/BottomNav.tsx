// src/components/BottomNav.tsx
//
// Barra de navegação inferior — pílula escura com "bolha líquida".
//
// O item ativo vira um círculo claro que salta para fora da barra, e a
// superfície da barra AFUNDA em curva côncava ao redor dele, como se o círculo
// tivesse sido empurrado para fora de um material maleável.
//
// COMO O ENTALHE É FEITO
//
// Em CSS esse efeito costuma sair de um `box-shadow` com spread e raio de canto
// invertido. Aqui ele é um caminho SVG desenhado na COR DE FUNDO da tela,
// posicionado sobre a borda superior da barra: ele apaga a barra do topo até a
// curva do vale. Nas pontas a curva encosta em y=0, então a emenda com a borda
// reta é contínua — não existe degrau.
//
// A vantagem prática de "apagar por cima" em vez de recortar a forma da barra:
// o entalhe é um nó independente, então ele desliza com `translateX` na thread
// nativa. Animar o `d` de um path exigiria recalcular a string a cada quadro.
//
// POR QUE A POSIÇÃO É COMPARTILHADA ENTRE AS INSTÂNCIAS
//
// Cada tela monta a sua própria BottomNav. A versão anterior animava na
// montagem, o que cobria só metade dos casos: ir de Início para Sessões monta
// uma barra nova (anima), mas voltar chama `popToTop()`, que DESEMPILHA Sessões
// e revela a Home que nunca saiu da memória — nenhuma barra é montada, nada
// re-renderiza, e a bolha aparecia já no lugar. Era o teletransporte.
//
// A correção tem duas partes:
//
//   1. O valor da animação vive no MÓDULO, não na instância. Todas as barras
//      leem o mesmo `indicator`, então a que está visível sempre reflete a
//      posição real — inclusive durante a transição, quando duas coexistem.
//   2. Quem dispara é o `useFocusEffect`, e não a montagem. Ele roda toda vez
//      que a tela ganha foco, seja por empilhar ou por desempilhar.
//
// COMO A FLUIDEZ É OBTIDA
//
// Nada aqui depende de re-render durante o movimento. Ícone e rótulo de cada
// aba existem os dois ao mesmo tempo, empilhados, e trocam por OPACIDADE
// derivada do mesmo `indicator` — sem o corte seco de "some o ícone, aparece o
// texto". Junto com o mergulho da bolha e o alargamento do vale no meio do
// caminho, tudo roda na thread nativa num único valor animado.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../styles/theme';
import { Icon, type IconName } from './ui/Icon';
import { PressableScale } from './ui/Pressable';
import { Txt } from './ui/Txt';

export const NAV_ITEMS: Array<{ icon: IconName; label: string; key: NavKey }> = [
  { icon: 'home', label: 'Início', key: 'home' },
  { icon: 'search', label: 'Pesquisar', key: 'search' },
  { icon: 'sessions', label: 'Sessões', key: 'sessions' },
  { icon: 'profile', label: 'Perfil', key: 'profile' },
];

export type NavKey = 'home' | 'search' | 'sessions' | 'profile';

const LAST = NAV_ITEMS.length - 1;

/* ── Medidas ─────────────────────────────────────────────────────────────── */

const SIDE_PADDING = theme.space[4];
const BAR_HEIGHT = 64;
const BUBBLE = 52;
/** Quanto da bolha fica acima da borda da barra. */
const BUBBLE_LIFT = 26;
/** Largura e profundidade do vale. */
const CUT_W = 92;
const CUT_D = 30;

/* ── Ajustes de movimento ────────────────────────────────────────────────── */

/**
 * A mola do deslocamento.
 *
 * CUIDADO ao mexer: `tension`/`friction` NÃO são rigidez e amortecimento. O RN
 * passa os dois pelo mapeamento Origami antes de integrar a mola:
 *
 *   rigidez        k = (tensão − 30) × 3,62 + 194
 *   amortecimento  c = (atrito − 8) × 3 + 25
 *
 * E daí saem as duas coisas que importam:
 *
 *   ζ = c / (2·√k)              → 0,68 aqui: ~5,6% de ultrapassagem, o quique
 *                                 no fim que faz o movimento ler como líquido.
 *   acomodação ≈ 8 / c          → ~500ms, tempo de o olho acompanhar o trajeto.
 *
 * Por isso os números parecem baixos: valores "normais" caem em ζ ≈ 1, onde a
 * mola chega dura e sem quique. O padrão do tema (70/11), por exemplo, dá ζ=0,92
 * e 235ms — rápido e mecânico, exatamente o que não queremos aqui.
 *
 * Menos atrito = mais elástico e mais lento. Mais tensão = mais rápido.
 */
const TRAVEL_SPRING = { tension: 15, friction: 5 };
/** Quanto a bolha mergulha no meio do trajeto, em px. */
const DIP = 7;
/** Quanto o vale se alarga no meio do trajeto — o "esticar" do líquido. */
const STRETCH = 1.14;

/**
 * O vale, em cima da barra.
 *
 * Sai e chega na horizontal (controles com o mesmo y das pontas), o que faz a
 * emenda com a borda reta ser suave; e chega no fundo também na horizontal, o
 * que dá o berço plano onde a bolha se apoia.
 */
const NOTCH_PATH =
  `M 0 0` +
  ` C 18 0, 20 ${CUT_D}, ${CUT_W / 2} ${CUT_D}` +
  ` C ${CUT_W - 20} ${CUT_D}, ${CUT_W - 18} 0, ${CUT_W} 0` +
  ` Z`;

/* ── Estado compartilhado ────────────────────────────────────────────────── */

/** Posição da bolha, em índice de aba. Compartilhado por todas as instâncias. */
const indicator = new Animated.Value(0);
/** Para onde o indicador já está indo — evita reanimar para o mesmo lugar. */
let targetIndex = 0;
/** A primeiríssima aba focada aparece pronta, sem deslizar de lugar nenhum. */
let hasFocusedOnce = false;

/** Entradas com meio passo: é o que permite um valor diferente no meio do caminho. */
const HALF_STEPS = (() => {
  const input: number[] = [];
  for (let i = 0; i <= LAST; i++) {
    input.push(i);
    if (i < LAST) input.push(i + 0.5);
  }
  return input;
})();
const atRest = <T,>(rest: T, mid: T): T[] => HALF_STEPS.map((v) => (v % 1 === 0 ? rest : mid));

const ONE = new Animated.Value(1);

interface Props {
  active: NavKey;
  onPress: (key: NavKey) => void;
}

export const BottomNav: React.FC<Props> = ({ active, onPress }) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) => item.key === active),
  );

  // A largura da barra é dedutível da tela; o onLayout só refina (e cobre
  // rotação e telas divididas). Sem depender dele, a barra já nasce posicionada.
  const [measured, setMeasured] = useState(0);
  const barWidth = measured || windowWidth - SIDE_PADDING * 2;
  const tabWidth = barWidth / NAV_ITEMS.length;
  const centers = useMemo(() => NAV_ITEMS.map((_, i) => tabWidth * (i + 0.5)), [tabWidth]);

  const running = useRef<Animated.CompositeAnimation | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce) {
        hasFocusedOnce = true;
        targetIndex = activeIndex;
        indicator.setValue(activeIndex);
        return;
      }
      if (targetIndex === activeIndex) return;
      targetIndex = activeIndex;
      // Interrompe a mola anterior: trocar de aba no meio de um trajeto deve
      // redirecionar a bolha a partir de onde ela está, não somar animações.
      running.current?.stop();
      running.current = Animated.spring(indicator, {
        toValue: activeIndex,
        useNativeDriver: true,
        ...TRAVEL_SPRING,
      });
      running.current.start();
    }, [activeIndex]),
  );

  const inputRange = NAV_ITEMS.map((_, i) => i);
  const bubbleX = indicator.interpolate({
    inputRange,
    outputRange: centers.map((c) => c - BUBBLE / 2),
  });
  const notchX = indicator.interpolate({
    inputRange,
    outputRange: centers.map((c) => c - CUT_W / 2),
  });
  const bubbleDip = indicator.interpolate({
    inputRange: HALF_STEPS,
    outputRange: atRest(0, DIP),
  });
  const notchStretch = indicator.interpolate({
    inputRange: HALF_STEPS,
    outputRange: atRest(1, STRETCH),
  });

  /** 1 quando a bolha está exatamente sobre a aba `i`, 0 nas vizinhas. */
  const focusOf = (i: number) =>
    indicator.interpolate({
      inputRange: i === 0 ? [0, 1] : i === LAST ? [LAST - 1, LAST] : [i - 1, i, i + 1],
      outputRange: i === 0 ? [1, 0] : i === LAST ? [0, 1] : [0, 1, 0],
      extrapolate: 'clamp',
    });

  return (
    <View
      style={[
        styles.root,
        { paddingBottom: Math.max(insets.bottom, theme.space[2]) + theme.space[2] },
      ]}
    >
      <View style={styles.bar} onLayout={(e) => setMeasured(e.nativeEvent.layout.width)}>
        {/* O vale: pintado na cor do fundo, apaga o topo da barra. */}
        <Animated.View
          style={[
            styles.notch,
            { transform: [{ translateX: notchX }, { scaleX: notchStretch }] },
          ]}
        >
          <Svg width={CUT_W} height={CUT_D} viewBox={`0 0 ${CUT_W} ${CUT_D}`}>
            <Path d={NOTCH_PATH} fill={theme.colors.card} />
          </Svg>
        </Animated.View>

        {NAV_ITEMS.map(({ icon, label, key }, i) => {
          const focus = focusOf(i);
          return (
            <PressableScale
              key={key}
              onPress={() => onPress(key)}
              scaleTo={0.92}
              dimTo={0.8}
              style={styles.item}
              accessibilityRole="tab"
              accessibilityState={{ selected: i === activeIndex }}
              accessibilityLabel={label}
            >
              {/* Ícone e rótulo coexistem e trocam por opacidade: é isso que
                  elimina o corte seco no meio do movimento. */}
              <Animated.View
                style={[styles.itemIcon, { opacity: Animated.subtract(ONE, focus) }]}
              >
                <Icon name={icon} size={20} color={theme.colors.onDarkMuted} />
              </Animated.View>
              <Animated.View style={[styles.itemLabel, { opacity: focus }]}>
                <Txt variant="micro" numberOfLines={1} tone="inverse" style={styles.labelText}>
                  {label}
                </Txt>
              </Animated.View>
            </PressableScale>
          );
        })}

        {/* A bolha vem por último: fica acima de tudo, inclusive do vale. */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bubble,
            { transform: [{ translateX: bubbleX }, { translateY: bubbleDip }] },
          ]}
        >
          {NAV_ITEMS.map(({ icon, key }, i) => (
            <Animated.View key={key} style={[styles.bubbleIcon, { opacity: focusOf(i) }]}>
              <Icon name={icon} size={21} color={theme.brand[900]} />
            </Animated.View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

/**
 * Roteamento padrão da bottom nav. `home` usa popToTop para não empilhar uma
 * segunda Home quando o usuário volta de outra aba.
 */
export function useBottomNavHandler(navigation: any) {
  return useCallback(
    (key: NavKey) => {
      if (key === 'home') {
        if (typeof navigation?.popToTop === 'function') navigation.popToTop();
        else navigation?.navigate?.('Home');
        return;
      }
      if (key === 'search') {
        navigation?.navigate?.('Search');
        return;
      }
      if (key === 'sessions') {
        navigation?.navigate?.('Sessions');
        return;
      }
      if (key === 'profile') {
        navigation?.navigate?.('Profile');
      }
    },
    [navigation],
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: SIDE_PADDING,
    // Espaço para a bolha, que sobe além da barra.
    paddingTop: BUBBLE_LIFT + theme.space[2],
  },
  bar: {
    flexDirection: 'row',
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: theme.brand[900],
    // A bolha precisa escapar para cima.
    overflow: 'visible',
    ...theme.shadow.md,
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CUT_W,
    height: CUT_D,
  },
  item: {
    flex: 1,
    minWidth: 0,
    height: BAR_HEIGHT,
  },
  itemIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: theme.space[2],
    alignItems: 'center',
  },
  labelText: {
    fontFamily: theme.fonts.semibold,
    fontSize: 11,
  },
  bubble: {
    position: 'absolute',
    top: -BUBBLE_LIFT,
    left: 0,
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
    backgroundColor: theme.colors.card,
    ...theme.shadow.sm,
  },
  bubbleIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
