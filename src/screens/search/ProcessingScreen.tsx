// src/screens/search/ProcessingScreen.tsx
//
// TELA 05 — PROCESSAMENTO (passo 3 de 4)
//
// É a tela mais longa do fluxo (a IA leva dezenas de segundos) e a que mais
// define a percepção de qualidade do produto. Por isso ela é a única totalmente
// escura: a espera vira um momento de marca, não um vazio.
//
// O que mudou além do visual:
//
//   • A lista de fontes consultadas passou a ser renderizada. O estado já era
//     calculado a partir dos eventos SSE, mas nada aparecia na tela — o usuário
//     via só uma barra andando sozinha. Ver "consultando o site da montadora"
//     explica a espera e é o argumento de valor do produto.
//   • Cronômetro de tempo decorrido: quando o percentual empaca entre dois
//     eventos, é ele que diz que o app não travou.
//   • "Cancelar" pede confirmação — antes um toque acidental descartava uma
//     pesquisa que já estava rodando no servidor.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { liftForDark, theme, withAlpha } from '../../styles/theme';
import { SEARCH_SOURCES, type SearchSource } from '../../mocks/vehicleData';
import { useCreateSearch } from '../../hooks/useSearches';
import { streamSearchProgress, type ProgressStreamHandle } from '../../services/sse';
import type { SearchProgressEvent } from '../../types/api';
import {
  Badge,
  Button,
  ConfirmSheet,
  Icon,
  ProgressRing,
  ScanGrid,
  Screen,
  SpectrumRay,
  Stepper,
  Txt,
  categoryIdentity,
  type IconName,
} from '../../components/ui';

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
  /** Sessão a que esta pesquisa pertence. */
  sessionId: string;
  sessionName?: string;
}

interface Props {
  navigation?: any;
  route?: { params?: RouteParams };
}

const SOURCE_ICONS: Record<string, IconName> = {
  official: 'company',
  reviews: 'sources',
  youtube: 'trend',
  presskit: 'pdf',
};

const initialSources = (): SourceState[] =>
  SEARCH_SOURCES.map((src) => ({
    ...src,
    status: 'pending',
    fieldsFound: 0,
    message: 'Na fila',
  }));

export const ProcessingScreen: React.FC<Props> = ({ navigation, route }) => {
  const params = route?.params;
  const insets = useSafeAreaInsets();

  const [sources, setSources] = useState<SourceState[]>(initialSources);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Enfileirando pesquisa...');
  const [totalFields, setTotalFields] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const createSearch = useCreateSearch();
  const queryClient = useQueryClient();
  const triggeredRef = useRef(false);
  const streamRef = useRef<ProgressStreamHandle | null>(null);

  const fadeInAnim = useRef(new Animated.Value(0)).current;
  const doneScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: theme.motion.slow,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeInAnim]);

  // Cronômetro — para de contar quando termina ou falha.
  useEffect(() => {
    if (isDone || errorMsg) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isDone, errorMsg]);

  const advanceNextPending = useCallback(
    (sourceLabel: string | null, status: SourceStatus, fields: number) => {
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
                ? 'Sem resposta — seguindo adiante'
                : 'Consultando...'),
        };
        return next;
      });
    },
    [],
  );

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
        setSources((prev) =>
          prev.map((s) => (s.status === 'pending' || s.status === 'running'
            ? { ...s, status: 'done', message: 'Concluído' }
            : s)),
        );
        // Histórico da Home e da sessão precisam refletir a pesquisa nova.
        void queryClient.invalidateQueries({ queryKey: ['searches', 'list'] });
        void queryClient.invalidateQueries({ queryKey: ['searches', 'count'] });
        Animated.spring(doneScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          ...theme.motion.spring,
        }).start();
        streamRef.current?.close();
        streamRef.current = null;
        setTimeout(() => {
          navigation?.replace?.('Result', { searchId: ev.searchId });
        }, 1400);
      }

      if (ev.phase === 'FAILED') {
        setErrorMsg(ev.message ?? 'Falha ao processar a pesquisa.');
        streamRef.current?.close();
        streamRef.current = null;
      }
    },
    [advanceNextPending, doneScaleAnim, navigation, queryClient],
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
        sessionId: params.sessionId,
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

  useEffect(
    () => () => {
      streamRef.current?.close();
      streamRef.current = null;
    },
    [],
  );

  // Mesmo motivo da tela de perfil: `Alert.alert` não existe no RN Web, então
  // a confirmação é um sheet do app.
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!params) return null;

  const vehicleLabel = `${params.brand} ${params.model} ${params.trim}`.trim();
  const doneFields = totalFields || sources.reduce((s, src) => s + src.fieldsFound, 0);
  const percent = Math.round(progress * 100);

  return (
    <Screen background={theme.brand[900]}>
      <ScanGrid />

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + theme.space[4], paddingBottom: insets.bottom + theme.space[6] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Stepper
          onDark
          steps={['Veículo', 'Categorias', 'Pesquisa', 'Resultado']}
          current={isDone ? 3 : 2}
        />

        <Animated.View style={{ opacity: fadeInAnim, alignItems: 'center' }}>
          <View style={styles.ringWrap}>
            {isDone ? (
              <Animated.View style={[styles.doneBadge, { transform: [{ scale: doneScaleAnim }] }]}>
                <Icon name="check" size={38} color={theme.brand[900]} />
              </Animated.View>
            ) : (
              <ProgressRing progress={errorMsg ? 0 : progress} size={168} strokeWidth={9}>
                <View style={{ alignItems: 'center' }}>
                  <Txt variant="display" tone="inverse">
                    {errorMsg ? '—' : `${percent}%`}
                  </Txt>
                  <Txt variant="micro" tone="inverseFaint" uppercase style={{ letterSpacing: 1.2 }}>
                    {errorMsg ? 'Interrompido' : 'Analisando'}
                  </Txt>
                </View>
              </ProgressRing>
            )}
          </View>

          <Txt variant="title1" tone="inverse" center style={{ marginTop: theme.space[5] }}>
            {errorMsg ? 'Não foi desta vez' : isDone ? 'Pesquisa concluída' : 'IA em ação'}
          </Txt>
          <Txt variant="caption" tone="inverseMuted" center style={{ marginTop: 6, maxWidth: 300 }}>
            {errorMsg
              ? errorMsg
              : isDone
                ? `${doneFields} campos extraídos para ${vehicleLabel}`
                : statusMessage}
          </Txt>

          <View style={styles.metaRow}>
            <Badge label={vehicleLabel} tone="onDark" size="sm" icon="vehicle" />
            {!isDone && !errorMsg ? (
              <Badge label={formatElapsed(elapsed)} tone="onDark" size="sm" icon="time" />
            ) : null}
          </View>
        </Animated.View>

        {/* Fontes consultadas: o que justifica a espera. */}
        <View style={styles.sourcesBlock}>
          <Txt variant="label" tone="inverseFaint" uppercase style={{ marginBottom: theme.space[3] }}>
            Fontes consultadas
          </Txt>
          {sources.map((src) => (
            <SourceRow key={src.id} source={src} />
          ))}
        </View>

        {/* Cada categoria mantém aqui a cor e o ícone que tinha na tela de
            seleção — é o mesmo conjunto de escolhas sendo processado, e a cor
            é o que deixa isso óbvio sem precisar reler os nomes. */}
        <View style={styles.pills}>
          {params.categories.map((cat) => {
            const identity = categoryIdentity(cat);
            const color = liftForDark(identity.color);
            return (
              <View
                key={cat}
                style={[
                  styles.pill,
                  { backgroundColor: withAlpha(color, 0.14), borderColor: withAlpha(color, 0.4) },
                ]}
              >
                <Icon name={identity.icon} size={10} color={color} />
                <Txt variant="micro" color={color} style={{ fontSize: 10 }}>
                  {cat}
                </Txt>
              </View>
            );
          })}
        </View>

        {!isDone ? (
          <Button
            label={errorMsg ? 'Voltar' : 'Cancelar pesquisa'}
            variant="onDark"
            onPress={errorMsg ? () => navigation?.goBack() : () => setConfirmCancel(true)}
            style={{ marginTop: theme.space[6] }}
          />
        ) : null}
      </ScrollView>

      <ConfirmSheet
        visible={confirmCancel}
        icon="close"
        title="Sair da pesquisa?"
        description="A análise continua rodando no servidor — você pode acompanhar o resultado depois pelo histórico da sessão."
        confirmLabel="Sair e acompanhar depois"
        cancelLabel="Continuar aguardando"
        onConfirm={() => {
          setConfirmCancel(false);
          navigation?.goBack();
        }}
        onCancel={() => setConfirmCancel(false)}
      />
    </Screen>
  );
};

/* ── Linha de fonte ──────────────────────────────────────────────────────── */

const SourceRow: React.FC<{ source: SourceState }> = ({ source }) => {
  const running = source.status === 'running';
  const done = source.status === 'done';
  const failed = source.status === 'warning';

  return (
    <View style={[styles.sourceRow, running && styles.sourceRowActive]}>
      <View
        style={[
          styles.sourceIcon,
          done && { backgroundColor: 'rgba(44,229,213,0.16)' },
          running && { backgroundColor: 'rgba(131,192,255,0.20)' },
        ]}
      >
        <Icon
          name={done ? 'check' : failed ? 'warning' : (SOURCE_ICONS[source.id] ?? 'sources')}
          size={13}
          color={
            done
              ? theme.aqua[500]
              : failed
                ? '#FFC9A3'
                : running
                  ? theme.brand[300]
                  : 'rgba(255,255,255,0.4)'
          }
        />
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Txt
          variant="captionStrong"
          tone={source.status === 'pending' ? 'inverseFaint' : 'inverse'}
          numberOfLines={1}
        >
          {source.name}
        </Txt>
        <Txt variant="micro" tone="inverseFaint" numberOfLines={1} style={{ fontSize: 10 }}>
          {source.message}
        </Txt>
      </View>

      {source.fieldsFound > 0 ? (
        <Txt variant="micro" color={theme.aqua[500]} style={{ fontFamily: theme.fonts.semibold }}>
          +{source.fieldsFound}
        </Txt>
      ) : null}

      {running ? <SpectrumRay height={2} rounded style={styles.sourceBeam} /> : null}
    </View>
  );
};

const formatElapsed = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}min ${String(s).padStart(2, '0')}s`;
};

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: theme.space[5],
  },
  ringWrap: {
    marginTop: theme.space[8],
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadge: {
    width: 168,
    height: 168,
    borderRadius: theme.radii.full,
    backgroundColor: theme.aqua[500],
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 0px 60px rgba(44, 229, 213, 0.45)',
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.space[2],
    marginTop: theme.space[4],
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  sourcesBlock: {
    marginTop: theme.space[8],
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: theme.space[2],
    overflow: 'hidden',
  },
  sourceRowActive: {
    borderColor: 'rgba(131,192,255,0.28)',
    backgroundColor: 'rgba(131,192,255,0.07)',
  },
  // Fio de luz na base da linha em execução — o "scan" acontecendo naquela fonte.
  sourceBeam: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  sourceIcon: {
    width: 30,
    height: 30,
    borderRadius: theme.radii.sm,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: theme.space[5],
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radii.full,
    borderWidth: 1,
  },
});
