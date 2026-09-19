// src/screens/compare/CompareScreen.tsx
//
// TELA — COMPARAÇÃO DE VEÍCULOS
//
// Roda sobre dados reais: N × GET /v1/searches/{id}/result, montados por
// `buildComparison` (src/utils/compare.ts, onde moram as regras de negócio).
//
// Três decisões que explicam o que está — e o que NÃO está — nesta tela:
//
//   • Compara-se a INTERSEÇÃO das categorias, não a igualdade. O que só um dos
//     veículos pesquisou não some: desce para "Só em <veículo>" no fim.
//
//   • Não há aiScore nem nota por categoria. Não existe nada na API para
//     calculá-los, e o app inteiro se sustenta em procedência declarada —
//     um "94/100" inventado no topo derruba a credibilidade de tudo abaixo.
//     No lugar dele vão números derivados: quantos campos são de fato
//     comparáveis e quantos itens cada veículo tem que o outro não tem.
//
//   • O destaque de vencedor é estreito de propósito (ver `resolveWinner`):
//     numérico só em campos de direção conhecida, mais Sim/Não, e nunca
//     quando algum dos lados está marcado como ESTIMADO.
//
// Sem foto e sem preço: a API não devolve nem um nem outro, e as fotos da
// versão mocada eram hotlink de CDN de terceiros.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { theme, withAlpha } from '../../styles/theme';
import {
  BottomInset,
  Callout,
  Card,
  ConfidenceBars,
  EmptyState,
  ErrorState,
  Icon,
  PressableScale,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  Txt,
  categoryIdentity,
  toConfidenceKey,
} from '../../components/ui';
import { useRecentSearches } from '../../hooks/useSearches';
import { getSearchResult } from '../../services/searches';
import { buildComparison, vehicleLabel, type CompareCategory, type CompareRow } from '../../utils/compare';
import type { SearchResultResponse, SearchSummary } from '../../types/api';

const MAX_VEHICLES = 3;
const MIN_VEHICLES = 2;
const PAGE_SIZE = 50;

/** Uma cor por coluna — a API não traz cor de marca. */
const COLUMN_COLORS = [theme.brand[700], theme.hues.teal, theme.hues.magenta];

interface RouteParams {
  /** Restringe o repertório às pesquisas de uma sessão. */
  sessionId?: string;
  sessionName?: string;
  /** Pré-seleção — usada quando a tela é aberta a partir de um resultado. */
  searchIds?: string[];
}

interface Props {
  navigation?: any;
  route?: { params?: RouteParams };
}

export const CompareScreen: React.FC<Props> = ({ navigation, route }) => {
  const params = route?.params;

  // Escopo: dentro da sessão de origem, ou todas as pesquisas do usuário.
  const [scope, setScope] = useState<'session' | 'all'>(params?.sessionId ? 'session' : 'all');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => (params?.searchIds ?? []).slice(0, MAX_VEHICLES),
  );
  const [activeCategory, setActiveCategory] = useState('all');
  const [highlight, setHighlight] = useState(true);
  const [onlyComparable, setOnlyComparable] = useState(false);

  const listQuery = useRecentSearches({
    sessionId: scope === 'session' ? params?.sessionId : undefined,
    page: 0,
    size: PAGE_SIZE,
  });

  // Só pesquisa concluída entra no comparativo: QUEUED/PROCESSING não têm
  // specs e FAILED não tem o que comparar.
  const candidates: SearchSummary[] = useMemo(
    () => (listQuery.data?.content ?? []).filter((item) => item.status === 'COMPLETED'),
    [listQuery.data],
  );

  // Completa a seleção com as pesquisas mais recentes até o mínimo de dois.
  useEffect(() => {
    setSelectedIds((current) => {
      const valid = current.filter((id) => candidates.some((c) => c.searchId === id));
      if (valid.length >= MIN_VEHICLES) return valid.length === current.length ? current : valid;
      const fill = candidates
        .map((c) => c.searchId)
        .filter((id) => !valid.includes(id))
        .slice(0, MIN_VEHICLES - valid.length);
      const next = [...valid, ...fill];
      return next.length === current.length && next.every((id, i) => id === current[i])
        ? current
        : next;
    });
  }, [candidates]);

  const resultQueries = useQueries({
    queries: selectedIds.map((id) => ({
      queryKey: ['searches', 'result', id] as const,
      queryFn: () => getSearchResult(id),
      staleTime: 1000 * 60 * 60,
    })),
  });

  const results = resultQueries.map((query) => query.data);
  const resultsLoading = resultQueries.some((query) => query.isLoading);
  const resultsError = resultQueries.find((query) => query.error)?.error;

  // Assinatura estável para o memo — o array de queries é recriado a cada
  // render (mesmo padrão já usado em useSearchCards).
  const signature = resultQueries.map((query) => query.data?.searchId ?? '').join('|');
  const model = useMemo(
    () => {
      const loaded = results.filter(Boolean) as SearchResultResponse[];
      return loaded.length >= MIN_VEHICLES && loaded.length === selectedIds.length
        ? buildComparison(loaded, highlight)
        : null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature, highlight, selectedIds.length],
  );

  const toggleVehicle = useCallback((searchId: string) => {
    setSelectedIds((current) => {
      if (current.includes(searchId)) {
        return current.length <= MIN_VEHICLES ? current : current.filter((id) => id !== searchId);
      }
      return current.length >= MAX_VEHICLES ? current : [...current, searchId];
    });
  }, []);

  // A categoria ativa precisa existir no conjunto atual — trocar de veículo
  // pode remover a categoria que estava filtrada.
  useEffect(() => {
    if (activeCategory === 'all') return;
    if (!model?.categories.some((category) => category.key === activeCategory)) {
      setActiveCategory('all');
    }
  }, [model, activeCategory]);

  const visibleCategories = useMemo(() => {
    const all = model?.categories ?? [];
    return activeCategory === 'all' ? all : all.filter((c) => c.key === activeCategory);
  }, [model, activeCategory]);

  /* ── Estados de exceção ─────────────────────────────────────────────── */

  const header = (subtitle?: string) => (
    <ScreenHeader
      onBack={() => navigation?.goBack()}
      eyebrow="Análise competitiva"
      title="Comparar"
      subtitle={subtitle}
      actions={
        <PressableScale
          onPress={() => setHighlight((value) => !value)}
          scaleTo={0.92}
          accessibilityRole="switch"
          accessibilityState={{ checked: highlight }}
          accessibilityLabel="Destacar melhor valor"
          style={[styles.toggle, highlight && styles.toggleActive]}
        >
          <Icon
            name="spark"
            size={11}
            color={highlight ? theme.brand[900] : theme.colors.onDarkMuted}
          />
          <Txt
            variant="micro"
            color={highlight ? theme.brand[900] : theme.colors.onDarkMuted}
            style={{ fontFamily: theme.fonts.semibold, fontSize: 10 }}
          >
            Destaques
          </Txt>
        </PressableScale>
      }
    />
  );

  if (listQuery.isLoading) {
    return (
      <Screen>
        {header('Carregando pesquisas…')}
        <View style={styles.section}>
          <SkeletonList count={3} />
        </View>
      </Screen>
    );
  }

  if (listQuery.error) {
    return (
      <Screen>
        {header()}
        <ErrorState
          description="Não foi possível carregar suas pesquisas."
          onRetry={() => void listQuery.refetch()}
        />
      </Screen>
    );
  }

  if (candidates.length < MIN_VEHICLES) {
    return (
      <Screen>
        {header()}
        <EmptyState
          icon="compare"
          title="Faltam pesquisas para comparar"
          description={
            scope === 'session'
              ? 'Esta sessão tem menos de duas pesquisas concluídas. Faça outra pesquisa ou compare entre sessões.'
              : 'A comparação precisa de pelo menos duas pesquisas concluídas.'
          }
          actionLabel={scope === 'session' ? 'Ver todas as pesquisas' : 'Nova pesquisa'}
          onAction={() =>
            scope === 'session' ? setScope('all') : navigation?.navigate('Search')
          }
        />
      </Screen>
    );
  }

  const selectedResults = results.filter(Boolean) as SearchResultResponse[];
  const colFlex = selectedIds.length === 2 ? 1 : 0.72;

  return (
    <Screen>
      {header(`${selectedIds.length} veículos lado a lado`)}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: theme.space[4] }}>
        {/* 1 — repertório de veículos */}
        <View style={styles.section}>
          <View style={styles.sectionTop}>
            <Txt variant="label" tone="muted" uppercase style={{ flex: 1 }}>
              Pesquisas concluídas
            </Txt>
            {params?.sessionId ? (
              <PressableScale
                onPress={() => setScope((value) => (value === 'session' ? 'all' : 'session'))}
                scaleTo={0.94}
                accessibilityRole="button"
                style={styles.scopeToggle}
              >
                <Icon name={scope === 'session' ? 'sessionOpen' : 'search'} size={10} color={theme.brand[700]} />
                <Txt variant="micro" tone="brand" style={{ fontFamily: theme.fonts.semibold, fontSize: 10 }}>
                  {scope === 'session' ? params.sessionName ?? 'Esta sessão' : 'Todas'}
                </Txt>
              </PressableScale>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.bleedContent}
          >
            {candidates.map((item) => {
              const index = selectedIds.indexOf(item.searchId);
              const selected = index >= 0;
              return (
                <PressableScale
                  key={item.searchId}
                  onPress={() => toggleVehicle(item.searchId)}
                  scaleTo={0.94}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <View
                    style={[
                      styles.chipDot,
                      {
                        backgroundColor: selected
                          ? COLUMN_COLORS[index % COLUMN_COLORS.length]
                          : theme.ink[200],
                      },
                    ]}
                  />
                  <Txt variant="micro" style={{ fontFamily: theme.fonts.semibold }} numberOfLines={1}>
                    {item.vehicle?.brand} {item.vehicle?.model}
                  </Txt>
                  {selected ? <Icon name="check" size={9} color={theme.brand[600]} /> : null}
                </PressableScale>
              );
            })}
          </ScrollView>

          <Txt variant="micro" tone="faint" style={{ marginTop: theme.space[2] }}>
            Até {MAX_VEHICLES} veículos. Toque para adicionar ou remover.
          </Txt>
        </View>

        {/* 2 — cartões dos veículos escolhidos */}
        {resultsLoading ? (
          <View style={styles.section}>
            <SkeletonList count={2} />
          </View>
        ) : resultsError ? (
          <View style={styles.section}>
            <ErrorState
              description="Não foi possível carregar a ficha de um dos veículos."
              onRetry={() => resultQueries.forEach((query) => void query.refetch())}
            />
          </View>
        ) : model ? (
          <>
            <View style={[styles.section, styles.cardsRow]}>
              {selectedResults.map((result, index) => (
                <VehicleCard
                  key={result.searchId}
                  result={result}
                  color={COLUMN_COLORS[index % COLUMN_COLORS.length]}
                  fields={model.stats.fieldsPerVehicle[index] ?? 0}
                  exclusive={model.stats.exclusiveFields[index] ?? 0}
                  onOpen={() => navigation?.navigate('Result', { searchId: result.searchId })}
                />
              ))}
            </View>

            {/* 3 — o que é comparável, em números derivados (não inventados) */}
            <View style={styles.section}>
              <Card>
                <View style={styles.statRow}>
                  <Icon name="compare" size={14} color={theme.brand[600]} />
                  <Txt variant="captionStrong" style={{ flex: 1 }}>
                    {model.stats.comparableFields} de {model.stats.totalFields} campos comparáveis
                  </Txt>
                </View>
                <Txt variant="micro" tone="muted" style={{ marginTop: 6 }}>
                  Um campo é comparável quando todos os veículos selecionados trouxeram valor
                  para ele. Os demais aparecem na tabela com o lado vazio marcado como
                  “não informado”.
                </Txt>
              </Card>
            </View>

            {/* 4 — categorias fora da interseção */}
            {model.exclusive.length > 0 ? (
              <View style={styles.section}>
                <Callout tone="warning" title="Categorias fora do comparativo">
                  {model.exclusive.map((category) => {
                    const owners = category.presentIn
                      .map((index) => vehicleLabel(selectedResults[index]))
                      .join(', ');
                    return `${category.name} — pesquisada só em ${owners}`;
                  }).join('\n')}
                  {'\n\n'}Elas ficam listadas no fim da tela, mas não entram lado a lado.
                </Callout>
              </View>
            ) : null}

            {model.categories.length === 0 ? (
              <View style={styles.section}>
                <EmptyState
                  icon="categories"
                  title="Nenhuma categoria em comum"
                  description="Estes veículos não têm nenhuma categoria pesquisada em comum, então não há o que colocar lado a lado. Pesquise o segundo veículo usando as mesmas categorias do primeiro."
                />
              </View>
            ) : (
              <>
                {/* 5 — filtros */}
                <View style={styles.filterWrap}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                  >
                    <FilterChip
                      label="Todas"
                      active={activeCategory === 'all'}
                      onPress={() => setActiveCategory('all')}
                    />
                    {model.categories.map((category) => (
                      <FilterChip
                        key={category.key}
                        label={category.name}
                        category={category.name}
                        active={activeCategory === category.key}
                        onPress={() => setActiveCategory(category.key)}
                      />
                    ))}
                  </ScrollView>

                  <View style={styles.filterActions}>
                    <PressableScale
                      onPress={() => setOnlyComparable((value) => !value)}
                      scaleTo={0.95}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: onlyComparable }}
                      style={[styles.softToggle, onlyComparable && styles.softToggleActive]}
                    >
                      <Icon
                        name={onlyComparable ? 'checkAll' : 'fields'}
                        size={10}
                        color={onlyComparable ? '#FFFFFF' : theme.colors.textMuted}
                      />
                      <Txt
                        variant="micro"
                        color={onlyComparable ? '#FFFFFF' : theme.colors.textMuted}
                        style={{ fontFamily: theme.fonts.semibold, fontSize: 10 }}
                      >
                        Só campos com par
                      </Txt>
                    </PressableScale>
                  </View>

                  <View style={styles.stickyHeader}>
                    <Txt variant="micro" tone="faint" uppercase style={styles.labelCol}>
                      Especificação
                    </Txt>
                    {selectedResults.map((result, index) => (
                      <View key={result.searchId} style={{ flex: colFlex, alignItems: 'center' }}>
                        <Txt
                          variant="micro"
                          color={COLUMN_COLORS[index % COLUMN_COLORS.length]}
                          style={{ fontFamily: theme.fonts.bold, fontSize: 10 }}
                          numberOfLines={1}
                        >
                          {result.vehicle?.brand}
                        </Txt>
                        <Txt variant="micro" tone="faint" numberOfLines={1} style={{ fontSize: 9 }}>
                          {result.vehicle?.model}
                        </Txt>
                      </View>
                    ))}
                  </View>
                </View>

                {/* 6 — tabelas */}
                {visibleCategories.map((category) => (
                  <CategoryTable
                    key={category.key}
                    category={category}
                    colFlex={colFlex}
                    onlyComparable={onlyComparable}
                  />
                ))}
              </>
            )}

            {/* 7 — o que ficou de fora, por veículo */}
            {model.exclusive.length > 0 ? (
              <View style={{ marginTop: theme.space[6] }}>
                <View style={styles.section}>
                  <SectionHeader title="Fora da interseção" />
                  <Txt variant="micro" tone="muted">
                    Categorias que só um dos veículos pesquisou. Para comparar, refaça a pesquisa
                    do outro veículo incluindo-as.
                  </Txt>
                </View>
                {model.exclusive.map((category) => (
                  <ExclusiveCategory
                    key={category.key}
                    category={category}
                    results={selectedResults}
                  />
                ))}
              </View>
            ) : null}
          </>
        ) : null}

        <BottomInset extra={theme.space[6]} />
      </ScrollView>
    </Screen>
  );
};

/* ── Peças ───────────────────────────────────────────────────────────────── */

const VehicleCard: React.FC<{
  result: SearchResultResponse;
  color: string;
  fields: number;
  exclusive: number;
  onOpen: () => void;
}> = ({ result, color, fields, exclusive, onOpen }) => {
  const vehicle = result.vehicle;
  return (
    <Card padding={0} variant="elevated" style={styles.vehicleCard} onPress={onOpen}>
      <View style={[styles.vehicleAccent, { backgroundColor: color }]} />
      <View style={styles.vehicleInfo}>
        <Txt variant="micro" color={color} style={{ fontFamily: theme.fonts.bold, fontSize: 9 }}>
          {(vehicle?.brand ?? '').toUpperCase()}
        </Txt>
        <Txt variant="captionStrong" numberOfLines={1}>
          {vehicle?.model}
        </Txt>
        <Txt variant="micro" tone="faint" numberOfLines={1}>
          {[vehicle?.trim, vehicle?.year].filter(Boolean).join(' · ') || '—'}
        </Txt>

        <View style={styles.vehicleMeta}>
          <Txt variant="micro" tone="muted" style={{ fontSize: 10 }}>
            {fields} campos
          </Txt>
          {exclusive > 0 ? (
            <View style={[styles.exclusivePill, { backgroundColor: withAlpha(color, 0.1) }]}>
              <Txt variant="micro" color={color} style={{ fontFamily: theme.fonts.bold, fontSize: 9 }}>
                +{exclusive} exclusivos
              </Txt>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
};

const CategoryTable: React.FC<{
  category: CompareCategory;
  colFlex: number;
  onlyComparable: boolean;
}> = ({ category, colFlex, onlyComparable }) => {
  const identity = categoryIdentity(category.name);
  const rows = onlyComparable ? category.rows.filter((row) => row.comparable) : category.rows;

  return (
    <View style={styles.specSection}>
      <View style={styles.specHead}>
        <View style={[styles.specHeadIcon, { backgroundColor: withAlpha(identity.color, 0.12) }]}>
          <Icon name={identity.icon} size={12} color={identity.color} />
        </View>
        <Txt variant="captionStrong" style={{ flex: 1 }}>
          {category.name}
        </Txt>
        <Txt variant="micro" tone="faint" style={{ fontSize: 10 }}>
          {category.comparableRows}/{category.rows.length}
        </Txt>
      </View>

      {rows.length === 0 ? (
        <Card>
          <Txt variant="micro" tone="muted" center>
            Nenhum campo desta categoria tem valor nos dois veículos.
          </Txt>
        </Card>
      ) : (
        <Card padding={0} style={{ overflow: 'hidden' }}>
          {rows.map((row, index) => (
            <SpecRow
              key={row.key}
              row={row}
              colFlex={colFlex}
              striped={index % 2 === 1}
              isLast={index === rows.length - 1}
            />
          ))}
        </Card>
      )}
    </View>
  );
};

const SpecRow: React.FC<{
  row: CompareRow;
  colFlex: number;
  striped: boolean;
  isLast: boolean;
}> = ({ row, colFlex, striped, isLast }) => (
  <View
    style={[
      styles.specRow,
      striped && { backgroundColor: theme.ink[25] },
      isLast && { borderBottomWidth: 0 },
    ]}
  >
    <View style={styles.labelCol}>
      <Txt variant="micro" tone="muted" numberOfLines={3}>
        {row.label}
      </Txt>
      {/* Os dois veículos nomearam o campo de formas diferentes — dizer isso é
          mais honesto do que esconder atrás de um rótulo só. */}
      {row.labelsDiverge ? (
        <Txt variant="micro" tone="faint" style={{ fontSize: 9, marginTop: 2 }} numberOfLines={2}>
          {row.labels.filter(Boolean).join(' · ')}
        </Txt>
      ) : null}
    </View>

    {row.cells.map((cell, index) => {
      const isWinner = row.winner === index;
      return (
        <View
          key={index}
          style={[styles.specValue, { flex: colFlex }, isWinner && styles.specValueWinner]}
        >
          {cell ? (
            <>
              <Txt
                variant="micro"
                numberOfLines={4}
                center
                style={{
                  fontFamily: isWinner ? theme.fonts.bold : theme.fonts.medium,
                  fontSize: 11,
                }}
              >
                {cell.value}
              </Txt>
              <View style={styles.cellMeta}>
                <ConfidenceBars level={toConfidenceKey(cell.source)} />
                {isWinner ? <Icon name="spark" size={8} color={theme.colors.success} /> : null}
              </View>
            </>
          ) : (
            <Txt variant="micro" tone="faint" center style={{ fontSize: 10 }}>
              não informado
            </Txt>
          )}
        </View>
      );
    })}
  </View>
);

const ExclusiveCategory: React.FC<{
  category: CompareCategory;
  results: SearchResultResponse[];
}> = ({ category, results }) => {
  const identity = categoryIdentity(category.name);
  const owners = category.presentIn.map((index) => vehicleLabel(results[index])).join(', ');

  return (
    <View style={styles.specSection}>
      <View style={styles.specHead}>
        <View style={[styles.specHeadIcon, { backgroundColor: withAlpha(identity.color, 0.12) }]}>
          <Icon name={identity.icon} size={12} color={identity.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="captionStrong">{category.name}</Txt>
          <Txt variant="micro" tone="faint" style={{ fontSize: 10 }}>
            Só em {owners}
          </Txt>
        </View>
      </View>

      <Card padding={0} style={{ overflow: 'hidden' }}>
        {category.rows.map((row, index) => {
          const cell = row.cells.find(Boolean);
          return (
            <View
              key={row.key}
              style={[
                styles.specRow,
                index % 2 === 1 && { backgroundColor: theme.ink[25] },
                index === category.rows.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <Txt variant="micro" tone="muted" numberOfLines={3} style={styles.labelCol}>
                {row.label}
              </Txt>
              <View style={[styles.specValue, { flex: 1.6 }]}>
                <Txt variant="micro" numberOfLines={3} center style={{ fontSize: 11 }}>
                  {cell?.value ?? '—'}
                </Txt>
                {cell ? (
                  <View style={styles.cellMeta}>
                    <ConfidenceBars level={toConfidenceKey(cell.source)} />
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </Card>
    </View>
  );
};

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  /** Sem categoria (o chip "Todas") o filtro usa o azul da marca. */
  category?: string;
}> = ({ label, active, onPress, category }) => {
  const identity = category ? categoryIdentity(category) : null;
  const color = identity?.color ?? theme.brand[700];

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.filterChip,
        active
          ? { backgroundColor: color, borderColor: color }
          : { borderColor: withAlpha(color, 0.28), backgroundColor: withAlpha(color, 0.06) },
      ]}
    >
      {identity ? <Icon name={identity.icon} size={10} color={active ? '#FFFFFF' : color} /> : null}
      <Txt
        variant="micro"
        color={active ? '#FFFFFF' : color}
        numberOfLines={1}
        style={{ fontFamily: theme.fonts.semibold, fontSize: 10 }}
      >
        {label}
      </Txt>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.space[4],
    marginBottom: theme.space[5],
  },
  sectionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    marginBottom: theme.space[3],
  },
  scopeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.brand[100],
    backgroundColor: theme.brand[50],
    maxWidth: 160,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  toggleActive: {
    backgroundColor: theme.aqua[500],
    borderColor: theme.aqua[500],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    flexGrow: 0,
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.card,
  },
  chipSelected: {
    borderColor: theme.brand[300],
    backgroundColor: theme.brand[50],
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  // Sangra o carrossel para fora do padding da seção.
  bleed: {
    marginHorizontal: -theme.space[4],
  },
  bleedContent: {
    gap: theme.space[2],
    paddingHorizontal: theme.space[4],
    alignItems: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: theme.space[2],
  },
  vehicleCard: {
    flex: 1,
    overflow: 'hidden',
  },
  vehicleAccent: {
    height: 3,
  },
  vehicleInfo: {
    padding: theme.space[3],
    gap: 1,
  },
  vehicleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  exclusivePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
  },
  filterWrap: {
    backgroundColor: theme.colors.canvas,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  filterContent: {
    gap: 6,
    paddingHorizontal: theme.space[4],
    paddingTop: theme.space[1],
    paddingBottom: theme.space[2],
    alignItems: 'center',
  },
  filterActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.space[4],
    paddingBottom: theme.space[3],
  },
  softToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.card,
  },
  softToggleActive: {
    backgroundColor: theme.brand[700],
    borderColor: theme.brand[700],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    flexGrow: 0,
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: theme.radii.full,
    borderWidth: 1,
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[2],
    backgroundColor: theme.ink[50],
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  specSection: {
    paddingHorizontal: theme.space[4],
    marginTop: theme.space[5],
  },
  specHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.space[2],
  },
  specHeadIcon: {
    width: 26,
    height: 26,
    borderRadius: theme.radii.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  labelCol: {
    width: 96,
    paddingRight: theme.space[2],
  },
  specValue: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 3,
  },
  specValueWinner: {
    backgroundColor: withAlpha(theme.colors.success, 0.08),
    borderRadius: theme.radii.xs,
    paddingVertical: 4,
  },
  cellMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
