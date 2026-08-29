// src/screens/result/ResultScreen.tsx
//
// TELA 06 — RESULTADO (passo 4 de 4)
//
// A entrega do produto. Ordem de leitura, de cima para baixo:
//
//   1. Que veículo é este e quanto tempo/acurácia custou    (header escuro)
//   2. Dá para confiar?  → distribuição de procedência       (ConfidenceSummary)
//   3. Os dados, por categoria, em acordeão                  (SpecTable)
//   4. De onde a IA tirou isso                               (Fontes)
//   5. O que fazer agora                                     (comparar/exportar)
//
// A pergunta "dá para confiar?" subiu para o topo porque é a que decide se o
// número vai parar num material comercial. Antes só existia um percentual de
// acurácia no header, sem dizer de onde ele vinha.

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { theme, withAlpha } from '../../styles/theme';
import { SpecTable, type SpecItem } from '../../components/SpecTable';
import { ExportSheet } from '../../components/ExportSheet';
import {
  ConfidenceSummary,
  type ConfidenceCounts,
} from '../../components/ConfidenceSummary';
import {
  Badge,
  BottomInset,
  Button,
  Card,
  ConfidenceBars,
  Divider,
  ErrorState,
  Icon,
  IconButton,
  PressableScale,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  StatRow,
  Txt,
  categoryIdentity,
  toConfidenceKey,
} from '../../components/ui';
import { useSearchResult } from '../../hooks/useSearches';
import { getExportUrl } from '../../services/searches';
import { extractApiErrorMessage } from '../../services/errorHandler';
import type { ExportFormat } from '../../types/api';

/* ── Fontes retornadas pela API ──────────────────────────────────────────── */
// O backend grava `sources` dentro do próprio JSON de specs, em dois formatos:
//   - array:  [{ url, title }, ...]  → quando o Gemini usou grounding
//   - string: "Busca feita por conhecimento da IA" → sem grounding
interface ApiSource {
  url?: string;
  title?: string;
}
type SourcesPayload = ApiSource[] | string | null | undefined;

const isSourceArray = (s: SourcesPayload): s is ApiSource[] => Array.isArray(s);

const hostnameFromUrl = (url: string | undefined): string => {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const openUrl = async (url: string | undefined) => {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {
    /* noop */
  }
};

/* ── Tela ────────────────────────────────────────────────────────────────── */

export const ResultScreen = ({ navigation, route }: any) => {
  const searchId: string | undefined = route?.params?.searchId;
  const categoryKeys: string[] = route?.params?.categoryKeys ?? [];

  const { data, isLoading, error, refetch } = useSearchResult(searchId);
  const queryClient = useQueryClient();

  const [exportVisible, setExportVisible] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Volta para a Home invalidando o cache da listagem — sem isso o React Query
  // serviria a lista antiga e a pesquisa nova não apareceria.
  const handleGoHome = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['searches', 'list'] });
    if (navigation?.canGoBack?.()) navigation.popToTop();
    else navigation?.navigate('Home');
  }, [queryClient, navigation]);

  // Abre a folha de detalhe do campo — onde o valor longo cabe inteiro e a
  // procedência é explicada.
  const openField = useCallback(
    (categoryName: string, item: SpecItem) => {
      navigation?.navigate('FieldDetail', {
        vehicleName: [data?.vehicle?.brand, data?.vehicle?.model].filter(Boolean).join(' '),
        fieldCategory: categoryName,
        fieldName: item.label,
        fieldValue: item.value,
        level: item.level,
      });
    },
    [navigation, data],
  );

  const handleExport = async (format: ExportFormat) => {
    if (!searchId || isExporting) return;
    setIsExporting(format);
    setExportError(null);
    try {
      const { downloadUrl } = await getExportUrl(searchId, format);
      await Linking.openURL(downloadUrl);
      setExportVisible(false);
    } catch (err) {
      setExportError(
        extractApiErrorMessage(err, {
          fallback: 'Não foi possível gerar o arquivo. Tente novamente.',
          byStatus: { 501: 'Exportação em PDF ainda não está disponível.' },
        }),
      );
    } finally {
      setIsExporting(null);
    }
  };

  // ── Normalização dos specs ────────────────────────────────────────────
  const { categories, counts, sources } = useMemo(() => {
    const rawSpecs = (data?.specs ?? {}) as Record<string, unknown>;
    const payload = rawSpecs.sources as SourcesPayload;

    const tally: ConfidenceCounts = { official: 0, review: 0, estimated: 0, total: 0 };
    const list: Array<{ name: string; items: SpecItem[] }> = [];

    Object.entries(rawSpecs).forEach(([categoryName, value]) => {
      if (categoryName === 'sources') return;
      if (categoryKeys.length > 0 && !categoryKeys.includes(categoryName)) return;

      const fields = (value ?? {}) as Record<string, { value?: string; source?: string }>;
      const items: SpecItem[] = Object.entries(fields).map(([fieldName, details]) => {
        const level = toConfidenceKey(details?.source);
        tally[level] += 1;
        tally.total += 1;
        return { label: fieldName, value: details?.value || 'N/A', level };
      });

      list.push({ name: categoryName, items });
    });

    return { categories: list, counts: tally, sources: payload };
  }, [data, categoryKeys]);

  /* ── Estados de carregamento / erro ─────────────────────────────────── */

  if (!searchId) {
    return (
      <Screen>
        <ScreenHeader onBack={() => navigation?.goBack()} title="Resultado" />
        <ErrorState
          title="Pesquisa não identificada"
          description="Volte e refaça o fluxo para abrir o resultado."
          onRetry={() => navigation?.goBack()}
        />
      </Screen>
    );
  }

  if (isLoading || (!data && !error)) {
    return (
      <Screen>
        <ScreenHeader onBack={handleGoHome} backIcon="home" eyebrow="Resultado" title="Carregando…" />
        <View style={styles.body}>
          <SkeletonList count={4} />
        </View>
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen>
        <ScreenHeader onBack={handleGoHome} backIcon="home" title="Resultado" />
        <ErrorState
          description="Não foi possível carregar o resultado desta pesquisa."
          onRetry={() => void refetch()}
        />
      </Screen>
    );
  }

  /* ── Conteúdo ───────────────────────────────────────────────────────── */

  const vehicle = data.vehicle ?? { brand: '', model: '', trim: '', year: null };
  const confidencePct =
    data.overallConfidence != null
      ? `${Math.round(Number(data.overallConfidence) * 100)}%`
      : counts.total > 0
        ? `${Math.round((counts.official / counts.total) * 100)}%`
        : '—';

  return (
    <Screen>
      <ScreenHeader
        onBack={handleGoHome}
        backIcon="home"
        backLabel="Início"
        actions={
          <IconButton
            icon="download"
            onPress={() => {
              setExportError(null);
              setExportVisible(true);
            }}
            accessibilityLabel="Exportar resultado"
          />
        }
        eyebrow={vehicle.brand}
        title={`${vehicle.model} ${vehicle.trim ?? ''}`.trim()}
      >
        {vehicle.year != null ? (
          <Badge
            label={String(vehicle.year)}
            tone="onDark"
            size="sm"
            icon="date"
            style={{ marginTop: theme.space[2] }}
          />
        ) : null}

        <StatRow
          onDark
          style={{ marginTop: theme.space[5] }}
          items={[
            { icon: 'confidence', value: confidencePct, label: 'Acurácia' },
            { icon: 'time', value: formatLatency(data.aiLatencyMs), label: 'Tempo' },
            { icon: 'fields', value: counts.total, label: 'Campos' },
          ]}
        />
      </ScreenHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <ConfidenceSummary counts={counts} />

        <SectionHeader title={`Ficha técnica · ${categories.length} categorias`} />

        <Card padding={0} style={{ overflow: 'hidden' }}>
          {categories.map((cat, i) => (
            <CategorySection
              key={cat.name}
              title={cat.name}
              items={cat.items}
              isLast={i === categories.length - 1}
              defaultOpen={categories.length === 1}
              onPressItem={(item) => openField(cat.name, item)}
            />
          ))}
        </Card>

        <SourcesSection sources={sources} />

        {/* Azure, e não o azul-marinho: comparar é uma ação forte, mas não é a
            continuação do fluxo — o CTA principal do app segue sendo só um. */}
        <Button
          label="Comparar ficha técnica"
          icon="compare"
          variant="accent"
          size="lg"
          onPress={() => navigation.navigate('Compare', { vehicleData: vehicle })}
          style={{ marginTop: theme.space[6] }}
        />
        <Button
          label="Voltar ao início"
          icon="home"
          variant="ghost"
          onPress={handleGoHome}
          style={{ marginTop: theme.space[2] }}
        />

        <BottomInset extra={theme.space[6]} />
      </ScrollView>

      <ExportSheet
        visible={exportVisible}
        isExporting={isExporting}
        errorMessage={exportError}
        onClose={() => setExportVisible(false)}
        onSelect={handleExport}
      />
    </Screen>
  );
};

/* ── Acordeão de categoria ───────────────────────────────────────────────── */

const CategorySection: React.FC<{
  title: string;
  items: SpecItem[];
  isLast: boolean;
  defaultOpen?: boolean;
  onPressItem?: (item: SpecItem) => void;
}> = ({ title, items, isLast, defaultOpen = false, onPressItem }) => {
  const [open, setOpen] = useState(defaultOpen);
  const rotate = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  // Distribuição da categoria — o resumo que evita ter que abrir para conferir.
  const dominant = useMemo(() => {
    const tally = { official: 0, review: 0, estimated: 0 };
    items.forEach((item) => {
      tally[item.level] += 1;
    });
    if (tally.official >= tally.review && tally.official >= tally.estimated) return 'official';
    if (tally.review >= tally.estimated) return 'review';
    return 'estimated';
  }, [items]);

  const { icon, color } = categoryIdentity(title);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
    Animated.timing(rotate, {
      toValue: open ? 0 : 1,
      duration: theme.motion.base,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  return (
    <View>
      <PressableScale
        onPress={toggle}
        scaleTo={0.995}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={[styles.accordionHead, open && { backgroundColor: withAlpha(color, 0.05) }]}
      >
        <View
          style={[
            styles.accordionIcon,
            { backgroundColor: open ? color : withAlpha(color, 0.12) },
          ]}
        >
          <Icon name={icon} size={15} color={open ? '#FFFFFF' : color} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="bodyStrong" numberOfLines={1}>
            {title}
          </Txt>
          <View style={styles.accordionMeta}>
            <Txt variant="micro" tone="faint">
              {items.length} {items.length === 1 ? 'campo' : 'campos'}
            </Txt>
            <ConfidenceBars level={dominant} />
          </View>
        </View>
        <Animated.View
          style={{
            transform: [
              { rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
            ],
          }}
        >
          <Icon name="chevronDown" size={11} color={theme.ink[400]} />
        </Animated.View>
      </PressableScale>

      {open ? (
        <View style={styles.accordionBody}>
          {items.length > 0 ? (
            <SpecTable data={items} onPressItem={onPressItem} />
          ) : (
            <Txt variant="caption" tone="faint">
              Nenhum campo extraído para esta categoria.
            </Txt>
          )}
        </View>
      ) : null}

      {!isLast ? <Divider /> : null}
    </View>
  );
};

/* ── Fontes ──────────────────────────────────────────────────────────────── */

const SourcesSection: React.FC<{ sources: SourcesPayload }> = ({ sources }) => {
  const [open, setOpen] = useState(false);
  const list = isSourceArray(sources) ? sources : [];
  const note = !isSourceArray(sources) && typeof sources === 'string' ? sources : null;

  const subtitle = note
    ? note
    : list.length > 0
      ? `${list.length} ${list.length === 1 ? 'origem consultada' : 'origens consultadas'}`
      : 'Nenhuma fonte registrada';

  return (
    <>
      <SectionHeader title="De onde veio" style={{ marginTop: theme.space[6] }} />
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <PressableScale
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setOpen((v) => !v);
          }}
          scaleTo={0.995}
          disabled={list.length === 0}
          style={styles.accordionHead}
        >
          <View style={styles.accordionIcon}>
            <Icon name="sources" size={15} color={theme.brand[700]} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="bodyStrong">Fontes utilizadas</Txt>
            <Txt variant="micro" tone="faint" numberOfLines={2}>
              {subtitle}
            </Txt>
          </View>
          {list.length > 0 ? (
            <Icon name={open ? 'chevronDown' : 'chevronRight'} size={11} color={theme.ink[400]} />
          ) : null}
        </PressableScale>

        {open && list.length > 0 ? (
          <View>
            {list.map((src, i) => (
              <PressableScale
                key={`${src.url ?? 'src'}-${i}`}
                onPress={() => openUrl(src.url)}
                disabled={!src.url}
                scaleTo={0.99}
                style={styles.sourceItem}
              >
                <Icon name="link" size={12} color={theme.brand[500]} />
                <View style={{ flex: 1, gap: 1 }}>
                  <Txt variant="captionStrong" numberOfLines={2}>
                    {src.title || hostnameFromUrl(src.url) || 'Fonte sem título'}
                  </Txt>
                  {src.url ? (
                    <Txt variant="micro" tone="faint" numberOfLines={1} style={{ fontSize: 10 }}>
                      {hostnameFromUrl(src.url)}
                    </Txt>
                  ) : null}
                </View>
                {src.url ? <Icon name="external" size={10} color={theme.ink[300]} /> : null}
              </PressableScale>
            ))}
          </View>
        ) : null}
      </Card>
    </>
  );
};

/* ── Utilitários ─────────────────────────────────────────────────────────── */

const formatLatency = (ms: number | null | undefined): string => {
  if (ms == null || Number.isNaN(ms)) return '—';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
};

const styles = StyleSheet.create({
  body: {
    padding: theme.space[4],
    paddingTop: theme.space[5],
  },
  accordionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
  },
  accordionIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  accordionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
  },
  accordionBody: {
    paddingHorizontal: theme.space[4],
    paddingBottom: theme.space[3],
    backgroundColor: theme.ink[25],
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
});
