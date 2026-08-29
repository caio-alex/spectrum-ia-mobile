// src/components/ui/Spectrum.tsx
//
// Os elementos gráficos que carregam a marca. Todos são SVG (react-native-svg),
// então escalam sem serrilhado e mudam de cor por prop.
//
//   SpectrumRay   — a faixa em degradê. É a assinatura: aparece na costura dos
//                   headers, nas barras de progresso e sob a aba ativa.
//   ScanGrid      — a malha + arcos que preenchem os headers escuros. Sugere
//                   varredura, que é literalmente o que o produto faz.
//   BrandMark     — o glifo de ondas concêntricas. Usado onde a logo cheia não
//                   cabe: estados vazios, carregamento, avatar.
//   ProgressRing  — anel de progresso com traço em degradê.
//   ProgressBar   — barra de progresso com preenchimento em degradê.
//   SpectrumFlow  — fundo em degradê azul que se desloca devagar. Para
//                   superfícies que devem parecer vivas sem pedir atenção.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';
import { theme } from '../../styles/theme';

let gradientSeq = 0;
const nextGradientId = (prefix: string) => `${prefix}-${(gradientSeq += 1)}`;

/* ── SpectrumRay ─────────────────────────────────────────────────────────── */

interface RayProps {
  height?: number;
  /** Arredonda as pontas. Off para a costura de topo (que encosta na borda). */
  rounded?: boolean;
  stops?: string[];
  style?: StyleProp<ViewStyle>;
  opacity?: number;
}

export const SpectrumRay: React.FC<RayProps> = ({
  height = 3,
  rounded = false,
  stops = theme.spectrum.stops,
  style,
  opacity = 1,
}) => {
  const id = useMemo(() => nextGradientId('ray'), []);
  return (
    <View style={[{ height, width: '100%', overflow: 'hidden' }, style]}>
      <Svg width="100%" height={height} preserveAspectRatio="none" viewBox="0 0 100 4">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
            {stops.map((color, i) => (
              <Stop key={color + i} offset={i / (stops.length - 1)} stopColor={color} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={100}
          height={4}
          rx={rounded ? 2 : 0}
          fill={`url(#${id})`}
          opacity={opacity}
        />
      </Svg>
    </View>
  );
};

const fillParent: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  // Em `style` e não como prop: a prop `pointerEvents` está deprecada no RN.
  pointerEvents: 'none',
};

/* ── ScanGrid ────────────────────────────────────────────────────────────── */

interface ScanGridProps {
  /** Cor das linhas — normalmente branco com alfa baixo sobre o azul. */
  color?: string;
  style?: StyleProp<ViewStyle>;
  /** Ecos concêntricos partindo do canto direito. */
  arcs?: boolean;
}

export const ScanGrid: React.FC<ScanGridProps> = ({
  color = 'rgba(255,255,255,0.9)',
  style,
  arcs = true,
}) => (
  <View style={[fillParent, style]}>
    <Svg width="100%" height="100%" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice">
      <G opacity={0.07}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Line key={`v${i}`} x1={i * 45} y1={0} x2={i * 45} y2={200} stroke={color} strokeWidth={1} />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <Line key={`h${i}`} x1={0} y1={i * 50} x2={360} y2={i * 50} stroke={color} strokeWidth={1} />
        ))}
      </G>
      {arcs && (
        <G opacity={0.16}>
          {[70, 118, 166, 214].map((r, i) => (
            <Circle
              key={r}
              cx={352}
              cy={26}
              r={r}
              stroke={color}
              strokeWidth={1.25}
              fill="none"
              opacity={1 - i * 0.22}
            />
          ))}
        </G>
      )}
    </Svg>
  </View>
);


/* ── BrandMark ───────────────────────────────────────────────────────────── */

interface BrandMarkProps {
  size?: number;
  /** `light` para fundo escuro, `brand` para fundo claro. */
  variant?: 'light' | 'brand' | 'gradient';
  style?: StyleProp<ViewStyle>;
}

/**
 * Ondas concêntricas partindo de um núcleo sólido: o sinal saindo, as fontes
 * respondendo. É a redução da logo a um símbolo que funciona em 20px.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ size = 40, variant = 'brand', style }) => {
  const id = useMemo(() => nextGradientId('mark'), []);
  const solid = variant === 'light' ? '#FFFFFF' : theme.brand[800];
  const stroke = variant === 'gradient' ? `url(#${id})` : solid;

  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
          <LinearGradient id={id} x1="6" y1="42" x2="44" y2="6" gradientUnits="userSpaceOnUse">
            {theme.spectrum.stops.map((color, i) => (
              <Stop
                key={color + i}
                offset={i / (theme.spectrum.stops.length - 1)}
                stopColor={color}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Circle cx={12} cy={36} r={5} fill={stroke} />
        <Path
          d="M12 24a12 12 0 0 1 12 12"
          stroke={stroke}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />
        <Path
          d="M12 14a22 22 0 0 1 22 22"
          stroke={stroke}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          opacity={0.6}
        />
        <Path
          d="M12 4a32 32 0 0 1 32 32"
          stroke={stroke}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          opacity={0.35}
        />
      </Svg>
    </View>
  );
};

/* ── ProgressBar ─────────────────────────────────────────────────────────── */

interface ProgressBarProps {
  /** 0 a 1. */
  progress: number;
  height?: number;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
  /** Anima a transição até o novo valor. */
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  trackColor = theme.ink[100],
  style,
  animated = true,
}) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const anim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    if (!animated) {
      anim.setValue(clamped);
      return;
    }
    Animated.timing(anim, {
      toValue: clamped,
      duration: theme.motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, animated, anim]);

  // O degradê fica sempre com a largura total e é a MÁSCARA que encolhe. Assim
  // as cores não "esticam" conforme o progresso — o espectro é sempre o mesmo.
  const maskWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['100%', '0%'],
  });

  return (
    <View
      style={[
        { height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden' },
        style,
      ]}
    >
      <SpectrumRay height={height} />
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: maskWidth,
          backgroundColor: trackColor,
        }}
      />
    </View>
  );
};

/* ── ProgressRing ────────────────────────────────────────────────────────── */

interface ProgressRingProps {
  /** 0 a 1. */
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  children?: React.ReactNode;
  /** Gira o traço continuamente — para o estado indeterminado. */
  spinning?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 148,
  strokeWidth = 10,
  trackColor = 'rgba(255,255,255,0.14)',
  children,
  spinning = false,
}) => {
  const id = useMemo(() => nextGradientId('ring'), []);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));

  const anim = useRef(new Animated.Value(clamped)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clamped,
      duration: theme.motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clamped, anim]);

  useEffect(() => {
    if (!spinning) return;
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spinning, spin]);

  const dashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          transform: spinning ? [{ rotate }] : [],
        }}
      >
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id={id} x1="0" y1={size} x2={size} y2="0" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={theme.brand[400]} />
              <Stop offset="0.5" stopColor={theme.brand[300]} />
              <Stop offset="1" stopColor={theme.aqua[500]} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${id})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashoffset as unknown as number}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
      </Animated.View>
      {children}
    </View>
  );
};

/* ── SpectrumFlow ────────────────────────────────────────────────────────── */

/**
 * Respeita a preferência de "reduzir movimento" do sistema.
 *
 * Um fundo que se mexe sozinho é exatamente o tipo de animação que incomoda
 * quem ativou essa opção — e que, em alguns casos, provoca enjoo. Com ela
 * ligada o degradê continua lá, só parado.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => {
        /* plataforma sem suporte — segue com animação */
      });

    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      active = false;
      sub?.remove();
    };
  }, []);

  return reduced;
}

interface SpectrumFlowProps {
  /** Duração de meia volta (ida). O ciclo completo é o dobro. */
  duration?: number;
  stops?: string[];
  style?: StyleProp<ViewStyle>;
}

/**
 * Fundo em degradê azul que se desloca lentamente.
 *
 * Como funciona: o degradê é desenhado com o DOBRO da largura do container, e o
 * que se move é ele, não as paradas de cor. Animar `x1/x2` de um LinearGradient
 * exigiria um nó animado por parada e re-render a cada quadro; deslocar um único
 * `translateX` roda na thread nativa e sai de graça.
 *
 * A largura da textura é `200%` — percentual, não medida. Só a AMPLITUDE do
 * deslocamento precisa de pixels, e para ela o `onLayout` é um refinamento, não
 * um pré-requisito: antes de medir usamos uma estimativa. Assim o degradê aparece
 * já no primeiro quadro. Depender da medição deixava o cartão chapado até o
 * layout chegar — e sem chegar nunca, chapado para sempre.
 *
 * O movimento é um vaivém (0 → 1 → 0) com embalo senoidal, e não um ciclo que
 * reinicia: assim nunca existe o "pulo" do momento em que a textura volta ao
 * começo, que é o que denuncia um degradê animado mal feito.
 *
 * As paradas ficam na metade escura da rampa de propósito. O espectro completo
 * termina no aqua, e texto branco sobre aqua tem contraste de 1,7:1 — ilegível.
 * Aqui o pior caso é o azure (5,5:1), acima do mínimo AA.
 */
export const SpectrumFlow: React.FC<SpectrumFlowProps> = ({
  duration = 7000,
  stops = [theme.brand[900], theme.brand[700], theme.brand[500], theme.brand[700], theme.brand[900]],
  style,
}) => {
  const id = useMemo(() => nextGradientId('flow'), []);
  const { width: windowWidth } = useWindowDimensions();
  const [measured, setMeasured] = useState(0);
  // Estimativa até o onLayout chegar: metade da tela cobre o caso comum (dois
  // cartões lado a lado). Um erro aqui muda só o quanto o degradê caminha.
  const width = measured || Math.round(windowWidth / 2);
  const shift = useRef(new Animated.Value(0)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shift, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(shift, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reducedMotion, duration, shift]);

  // O deslocamento é METADE da largura, não a largura inteira.
  //
  // A textura tem 200% do container, então ela cobre enquanto
  // `deslocamento + largura <= 2 x largura`, ou seja, enquanto o deslocamento não
  // passar de uma largura. Usar exatamente uma largura ficaria no limite — e a
  // largura pode ser a estimativa, não a medida. Com metade, a cobertura resiste
  // a uma estimativa até duas vezes maior que o cartão real; passar da borda
  // mostraria a cor de fundo e cortaria o degradê no meio.
  const translateX = shift.interpolate({ inputRange: [0, 1], outputRange: [0, -width / 2] });

  return (
    <View
      style={[fillParent, { backgroundColor: stops[0], overflow: 'hidden' }, style]}
      onLayout={(e) => setMeasured(e.nativeEvent.layout.width)}
    >
      <Animated.View style={[styles.flowLayer, { transform: [{ translateX }] }]}>
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="100" y2="0" gradientUnits="userSpaceOnUse">
              {stops.map((color, i) => (
                <Stop key={color + i} offset={i / (stops.length - 1)} stopColor={color} />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={100} height={100} fill={`url(#${id})`} />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  flowLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    // Percentual: a textura tem o dobro do container sem precisar de medição.
    width: '200%',
  },
});
