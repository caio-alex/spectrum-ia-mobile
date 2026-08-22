// src/screens/search/ProcessingScreen.tsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  TouchableOpacity,
  ScrollView,
  Easing,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { SearchSource, SEARCH_SOURCES } from '../../mocks/vehicleData';
import { styles } from '../../styles/processingScreen.styles';
import { useCreateSearch } from '../../hooks/useSearches';
import { streamSearchProgress, ProgressStreamHandle } from '../../services/sse';
import type { SearchProgressEvent } from '../../types/api';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';

type SourceStatus = 'pending' | 'running' | 'done' | 'warning';
interface SourceState extends SearchSource {
  status: SourceStatus;
  fieldsFound: number;
  message: string;
}

interface RouteParams {
  brand: string;
  model: string;
  trim: string;
  year: number;
  categories: string[];
  categoryKeys: string[];
}

interface Props {
  navigation?: any;
  route?: { params?: RouteParams };
}

const initialSources = (): SourceState[] =>
  SEARCH_SOURCES.map((src) => ({
    ...src,
    status: 'pending',
    fieldsFound: 0,
    message: 'Aguardando...',
  }));

export const ProcessingScreen: React.FC<Props> = ({ navigation, route }) => {
  const params = route?.params;

  const vehicleLabel = params ? `${params.brand} ${params.model} ${params.trim}` : '';

  const [sources, setSources] = useState<SourceState[]>(initialSources);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Enfileirando pesquisa...');
  const [totalFields, setTotalFields] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string | null>(null);

  const createSearch = useCreateSearch();
  const triggeredRef = useRef(false);
  const streamRef = useRef<ProgressStreamHandle | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const doneScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fadeInAnim, {
      toValue: 1,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [fadeInAnim]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const advanceNextPending = useCallback((sourceLabel: string | null, status: SourceStatus, fields: number) => {
    setSources((prev) => {
      const idx = prev.findIndex((s) => s.status === 'pending' || s.status === 'running');
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        status,
        fieldsFound: fields > 0 ? fields : next[idx].fieldsFound,
        message:
          sourceLabel ??
          (status === 'done'
            ? 'Concluído'
            : status === 'warning'
              ? 'Falhou — segue adiante'
              : 'Em andamento...'),
      };
      return next;
    });
  }, []);

  const handleEvent = useCallback(
    (ev: SearchProgressEvent) => {
      if (ev.progressPercent != null) {
        setProgress(Math.min(1, Math.max(0, ev.progressPercent / 100)));
      }
      if (ev.message) setStatusMessage(ev.message);
      if (ev.fieldsExtracted != null) {
        setTotalFields((prev) => Math.max(prev, ev.fieldsExtracted ?? 0));
      }

      if (ev.phase === 'SOURCE_PROGRESS' && ev.sourceStatus) {
        if (ev.sourceStatus === 'consultando') {
          advanceNextPending(ev.source, 'running', ev.fieldsExtracted ?? 0);
        } else if (ev.sourceStatus === 'concluida') {
          advanceNextPending(ev.source, 'done', ev.fieldsExtracted ?? 0);
        } else if (ev.sourceStatus === 'falhou') {
          advanceNextPending(ev.source, 'warning', ev.fieldsExtracted ?? 0);
        }
      }

      if (ev.phase === 'COMPLETED') {
        setIsDone(true);
        setProgress(1);
        Animated.spring(doneScaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 9,
          useNativeDriver: true,
        }).start();
        streamRef.current?.close();
        streamRef.current = null;
        setTimeout(() => {
          navigation?.replace?.('Result', { searchId: ev.searchId });
        }, 1200);
      }

      if (ev.phase === 'FAILED') {
        setErrorMsg(ev.message ?? 'Falha ao processar a pesquisa.');
        streamRef.current?.close();
        streamRef.current = null;
      }
    },
    [advanceNextPending, doneScaleAnim, navigation],
  );

  useEffect(() => {
    if (!params || triggeredRef.current) return;
    triggeredRef.current = true;

    createSearch.mutate(
      {
        brand: params.brand,
        model: params.model,
        trim: params.trim || undefined,
        year: params.year,
        categories: params.categoryKeys,
      },
      {
        onSuccess: (data) => {
          setSearchId(data.searchId);
          setStatusMessage('Pesquisa enfileirada. Aguardando início...');
        },
        onError: () => {
          setErrorMsg('Não foi possível iniciar a pesquisa. Tente novamente.');
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!searchId) return;
    const handle = streamSearchProgress(searchId, {
      onEvent: handleEvent,
      onError: () => {
        /* connection hiccups são esperados — o servidor reabre */
      },
    });
    streamRef.current = handle;
    return () => {
      handle.close();
      streamRef.current = null;
    };
  }, [searchId, handleEvent]);

  useEffect(() => {
    return () => {
      streamRef.current?.close();
      streamRef.current = null;
    };
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const doneFields = totalFields || sources.reduce((s, src) => s + src.fieldsFound, 0);

  if (!params) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {errorMsg ? 'Falha' : isDone ? 'Concluído ✓' : 'Pesquisando...'}
        </Text>
        <Text style={styles.headerSub}>{vehicleLabel}</Text>
      </View>
      <Animated.View style={[styles.body, { opacity: fadeInAnim }]}>
        <ScrollView contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          <View style={styles.spinnerSection}>
            {isDone ? (
              <Animated.View style={[styles.spinnerDone, { transform: [{ scale: doneScaleAnim }] }]}>
                <Text style={styles.spinnerDoneEmoji}>✓</Text>
              </Animated.View>
            ) : (
              <SpinnerRing />
            )}
            <Text style={styles.spinnerTitle}>
              {errorMsg ? 'Erro na pesquisa' : isDone ? 'Pesquisa concluída!' : 'IA em ação'}
            </Text>
            <Text style={styles.spinnerSubtitle}>
              {errorMsg
                ? 'Não foi possível concluir a pesquisa, tente novamente mais tarde.'
                : isDone
                  ? `${doneFields} campos encontrados`
                  : statusMessage}
            </Text>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <View style={styles.categoriesRow}>
              {params.categories.map((cat) => (
                <View key={cat} style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{cat}</Text>
                </View>
              ))}
            </View>
          </View>

          {!isDone && !errorMsg && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancelar pesquisa</Text>
            </TouchableOpacity>
          )}

          {errorMsg && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation?.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Voltar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

/**
 * Anel girando.
 *
 * Em RN Web o sistema Animated roda sempre na thread JS (useNativeDriver é
 * ignorado), então qualquer re-render do pai gera travadinhas visíveis.
 * Solução: em Web a animação é CSS pura (compositor do browser, totalmente
 * fora da thread JS); em nativo mantemos Animated.loop com useNativeDriver.
 *
 * O componente é envolvido em React.memo — sem props, ele nunca re-renderiza
 * quando o pai recebe um evento SSE.
 */
const SPIN_KEYFRAMES_ID = 'spectrum-spin-keyframes';

const ensureSpinKeyframes = () => {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (document.getElementById(SPIN_KEYFRAMES_ID)) return;
  const styleEl = document.createElement('style');
  styleEl.id = SPIN_KEYFRAMES_ID;
  styleEl.textContent = '@keyframes spectrum-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(styleEl);
};

const SpinnerRingNative: React.FC = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]}>

    </Animated.View>
  );
};

const SpinnerRingWeb: React.FC = () => {
  useEffect(() => {
    ensureSpinKeyframes();
  }, []);

  const webSpinStyle = {
    animationName: 'spectrum-spin',
    animationDuration: '2.8s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  } as unknown as object;

  return (
    <View style={[styles.spinnerRing, webSpinStyle]}>
      
    </View>
  );
};

const SpinnerRing: React.FC = React.memo(() => {
  const Ring = Platform.OS === 'web' ? SpinnerRingWeb : SpinnerRingNative;
  return (
    <View style={styles.spinnerContainer}>
      <Ring />
      <View style={styles.spinnerInner}>
        <Text style={styles.spinnerInnerEmoji}>🔍</Text>
      </View>
    </View>
  );
});
SpinnerRing.displayName = 'SpinnerRing';

// (componentes auxiliares mantidos para uso futuro)
const sourceStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});
export { sourceStyles };
