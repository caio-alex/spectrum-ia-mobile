// src/screens/result/ResultScreen.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, StatusBar, LayoutAnimation, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { SpecTable } from '../../components/SpecTable';
import { StatsBar } from '../../components/StatsBar';
import { styles } from '../../styles/resultScreen.styles';
import { sourceStyles } from '../../styles/resultScreen.styles';
import { theme } from '../../styles/theme';

import { CATEGORY_ICONS } from '../../mocks/vehicleData';
import { useSearchResult } from '../../hooks/useSearches';
import { getExportUrl } from '../../services/searches';

// Na New Architecture do RN, LayoutAnimation já fica habilitado por padrão —
// `UIManager.setLayoutAnimationEnabledExperimental` virou no-op e emite warning.

// ── COMPONENTE HAMBÚRGUER (ESTILO EXATO DAS FONTES) ─────────────────────────
const ExpandableCategorySection: React.FC<{ title: string; data: any[]; isLast: boolean }> = ({ title, data, isLast }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleSection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
    Animated.timing(rotateAnim, { toValue: isOpen ? 0 : 1, duration: 220, useNativeDriver: true }).start();
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const normalizedKey = title.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const icon = CATEGORY_ICONS[normalizedKey] || '📊';

  return (
    <View style={[!isLast && sourceStyles.itemBorder]}>
      <TouchableOpacity
        style={[sourceStyles.item, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
        onPress={toggleSection} activeOpacity={0.8}
      >
        <View style={sourceStyles.header}>
          <View style={sourceStyles.iconBox}>
            <Text style={sourceStyles.icon}>{icon}</Text>
          </View>
          <View style={sourceStyles.headerContent}>
            <Text style={sourceStyles.name}>{title.toUpperCase()}</Text>
            <Text style={sourceStyles.fields}>{data?.length || 0} campo(s) extraído(s)</Text>
          </View>
        </View>
        <Animated.Text style={[sourceStyles.chevron, { transform: [{ rotate }] }]}>▾</Animated.Text>
      </TouchableOpacity>

      
  {isOpen && (
    // Esse padding serve apenas para as letras não encostarem na borda, sem criar caixas novas!
    <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
      <SpecTable category="" data={data || []} />
    </View>
  )}
    </View>
  );
};

// ── COMPONENTE DE FONTES UTILIZADAS ──────────────────────────────────────────
// Consome o campo `sources` retornado pela API. O backend persiste dentro do
// próprio JSON de specs e pode vir em dois formatos:
//   - array: [{ url, title }, ...] — quando o Gemini usou grounding (Google Search)
//   - string: "Busca completamente feita por conhecimento da IA" — sem grounding
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

const openSource = async (url: string | undefined) => {
  if (!url) return;
  try {
    await Linking.openURL(url);
  } catch {
    /* noop */
  }
};

const SourcesSection: React.FC<{ sources: SourcesPayload }> = ({ sources }) => {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const list = isSourceArray(sources) ? sources : [];
  const note = !isSourceArray(sources) && typeof sources === 'string' ? sources : null;
  const count = list.length;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => !prev);
    Animated.timing(rotateAnim, {
      toValue: open ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const subtitle = note
    ? note
    : count > 0
      ? `${count} ${count === 1 ? 'origem encontrada' : 'origens encontradas'}`
      : 'Nenhuma fonte registrada';

  return (
    <View style={[sourceStyles.section, { marginTop: 15, marginBottom: 12 }]}>
      <TouchableOpacity style={sourceStyles.sectionHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={sourceStyles.sectionLeft}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>📂</Text>
          <View style={{ flex: 1 }}>
            <Text style={sourceStyles.sectionTitle}>Fontes utilizadas</Text>
            <Text style={sourceStyles.sectionSub} numberOfLines={2}>{subtitle}</Text>
          </View>
        </View>
        <Animated.Text style={[sourceStyles.chevron, { transform: [{ rotate }] }]}>▾</Animated.Text>
      </TouchableOpacity>

      {open && (
        <View style={sourceStyles.list}>
          {note && (
            <View style={[sourceStyles.item, { padding: 12 }]}>
              <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>{note}</Text>
            </View>
          )}
          {list.map((src, i) => {
            const title = src.title || hostnameFromUrl(src.url) || 'Fonte sem título';
            const subtitleText = hostnameFromUrl(src.url) || src.url || '';
            return (
              <TouchableOpacity
                key={`${src.url ?? 'src'}-${i}`}
                style={[
                  sourceStyles.item,
                  i !== list.length - 1 && sourceStyles.itemBorder,
                  { padding: 12 },
                ]}
                onPress={() => openSource(src.url)}
                activeOpacity={src.url ? 0.7 : 1}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, marginRight: 8 }}>🔗</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: '#333' }} numberOfLines={2}>
                      {title}
                    </Text>
                    {subtitleText ? (
                      <Text style={{ fontSize: 11, color: '#888' }} numberOfLines={1}>
                        {subtitleText}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};
// ── TELA PRINCIPAL DE RESULTADOS ─────────────────────────────────────────────
export const ResultScreen = ({ navigation, route }: any) => {
  const searchId: string | undefined = route?.params?.searchId;
  const categoryKeys: string[] = route?.params?.categoryKeys ?? [];

  const { data, isLoading, error, refetch } = useSearchResult(searchId);
  const queryClient = useQueryClient();

  // Volta para a Home invalidando o cache da listagem para forçar refetch —
  // sem isso, o React Query serviria a lista em cache e a nova pesquisa
  // não apareceria sem pull-to-refresh manual.
  const handleGoHome = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['searches', 'list'] });
    if (navigation?.canGoBack?.()) {
      navigation.popToTop();
    } else {
      navigation?.navigate('Home');
    }
  }, [queryClient, navigation]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const formatSourceAndStatus = (backendSource: string) => {
    switch (backendSource) {
      case 'OFFICIAL': return { source: 'Oficial', status: 'high' as const };
      case 'REVIEW': return { source: 'Review', status: 'medium' as const };
      default: return { source: 'Estimado', status: 'low' as const };
    }
  };

  const handleExport = async () => {
    if (!searchId) return;
    try {
      const { downloadUrl } = await getExportUrl(searchId);
      const fullUrl = downloadUrl.startsWith('http')
        ? downloadUrl
        : downloadUrl;
      await Linking.openURL(fullUrl);
    } catch {
      /* silenciar — botão é opcional */
    }
  };

  if (!searchId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ textAlign: 'center', color: theme.colors.text }}>
            Pesquisa não identificada. Volte e refaça o fluxo.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={{ marginTop: 12, color: theme.colors.textLight }}>
            Carregando resultado...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ textAlign: 'center', color: '#c0392b' }}>
            Não foi possível carregar o resultado.
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={{ marginTop: 16 }}>
            <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const vehicle = data.vehicle ?? { brand: '', model: '', trim: '', year: null };
  const rawSpecs = (data.specs ?? {}) as Record<string, unknown>;
  // O backend grava `sources` dentro do próprio objeto de specs.
  // Separamos aqui para não tratar como categoria no loop abaixo.
  const sources = rawSpecs.sources as SourcesPayload;
  const specs: Record<string, Record<string, { value?: string; source?: string }>> = {};
  Object.entries(rawSpecs).forEach(([key, value]) => {
    if (key === 'sources') return;
    specs[key] = value as Record<string, { value?: string; source?: string }>;
  });

  const confidencePct =
    typeof data.overallConfidence === 'number'
      ? `${Math.round(data.overallConfidence * 100)}%`
      : data.overallConfidence
        ? `${Math.round(Number(data.overallConfidence) * 100)}%`
        : '—';

  const formatLatency = (ms: number | null | undefined): string => {
    if (ms == null || Number.isNaN(ms)) return '—';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    const totalSeconds = Math.round(ms / 1000);
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return seconds === 0 ? `${minutes}min` : `${minutes}min ${seconds}s`;
  };

  const latencyLabel = formatLatency(data.aiLatencyMs);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={handleGoHome}
            activeOpacity={0.8}
            accessibilityLabel="Voltar para a Home"
          >
            <Text style={styles.backBtn}>← Voltar para home</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Análise Spectrum IA</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.pdfBtn} onPress={handleExport}>
              <Text style={styles.pdfIcon}>📄</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.vehicleInfo}>
          <Text style={styles.brandText}>{vehicle.brand}</Text>
          <Text style={styles.modelText}>{vehicle.model} {vehicle.trim ?? ''}</Text>
          {vehicle.year != null && (
            <View style={styles.badgeRow}>
              <View style={styles.yearBadge}>
                <Text style={styles.yearText}>{vehicle.year}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <StatsBar
            stats={[
              { label: 'Acurácia Geral', value: confidencePct, emoji: '🧠' },
              { label: 'Tempo de Pesquisa', value: latencyLabel, emoji: '⏱️' },
            ]}
          />
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>

          <View style={styles.insightCard}>
            <Text style={styles.insightEmoji}>⚡</Text>
            <Text style={styles.insightText}>
              Análise concluída para {vehicle.brand} {vehicle.model}. Exibindo as categorias selecionadas.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>CATEGORIAS SELECIONADAS</Text>

          <View style={sourceStyles.section}>
            {Object.keys(specs)
              .filter((categoryName) => {
                if (categoryKeys && categoryKeys.length > 0) {
                  return categoryKeys.includes(categoryName);
                }
                return true;
              })
              .map((categoryName, index, filteredArray) => {
                const currentCategoryFields = (specs as any)[categoryName] || {};

                const formattedFields = Object.keys(currentCategoryFields).map((fieldName) => {
                  const details = currentCategoryFields[fieldName] || {};
                  const { source, status } = formatSourceAndStatus(details.source || 'ESTIMATED');
                  return { label: fieldName, value: details.value || 'N/A', source, status };
                });

                const isLast = index === filteredArray.length - 1;

                return (
                  <ExpandableCategorySection
                    key={categoryName}
                    title={categoryName}
                    data={formattedFields}
                    isLast={isLast}
                  />
                );
              })}
          </View>

          <SourcesSection sources={sources} />

          <TouchableOpacity
            style={[styles.compareFab, { marginTop: 16 }]}
            onPress={() => navigation.navigate('Compare', { vehicleData: vehicle })}
          >
            <Text style={styles.compareFabText}>Comparar Ficha Técnica</Text>
          </TouchableOpacity>

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};