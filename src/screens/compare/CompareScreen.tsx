// src/screens/compare/CompareScreen.tsx
//
// TELA — COMPARAÇÃO DE VEÍCULOS
//
// Cards dos veículos analisados e comparação lado a lado das especificações,
// por categoria, com destaque do melhor valor de cada linha.
//
// ATENÇÃO: esta tela ainda roda 100% sobre `COMPARE_MOCK_VEHICLES`. Enquanto o
// backend não expõe um endpoint de comparativo, um aviso explícito no topo diz
// isso ao usuário — uma tela de análise competitiva com números inventados e
// sem etiqueta é o tipo de coisa que acaba em slide de cliente.
//
// Integração futura: GET /v1/searches/:id/result para cada veículo da sessão.

import React, { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { theme, withAlpha } from '../../styles/theme';
import {
  BottomInset,
  Callout,
  Card,
  Icon,
  PressableScale,
  Screen,
  ScreenHeader,
  Txt,
  categoryIdentity,
} from '../../components/ui';
import {
  COMPARE_MOCK_VEHICLES,
  COMPARE_SPEC_CATEGORIES,
  type CompareVehicle,
} from '../../mocks/compareData';

const MAX_VEHICLES = 3;
const MIN_VEHICLES = 2;

interface Props {
  navigation?: any;
  route?: { params?: { vehicleIds?: string[] } };
}

export const CompareScreen: React.FC<Props> = ({ navigation, route }) => {
  const passedIds = route?.params?.vehicleIds;

  const [selectedVehicles, setSelectedVehicles] = useState<CompareVehicle[]>(
    passedIds
      ? COMPARE_MOCK_VEHICLES.filter((v) => passedIds.includes(v.id))
      : COMPARE_MOCK_VEHICLES.slice(0, 2),
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [highlightWinner, setHighlightWinner] = useState(true);

  const toggleVehicle = useCallback((vehicle: CompareVehicle) => {
    setSelectedVehicles((prev) => {
      const isSelected = prev.some((v) => v.id === vehicle.id);
      if (isSelected) {
        if (prev.length <= MIN_VEHICLES) return prev;
        return prev.filter((v) => v.id !== vehicle.id);
      }
      if (prev.length >= MAX_VEHICLES) return prev;
      return [...prev, vehicle];
    });
  }, []);

  const visibleCategories = useMemo(
    () =>
      activeCategory === 'all'
        ? COMPARE_SPEC_CATEGORIES
        : COMPARE_SPEC_CATEGORIES.filter((c) => c.id === activeCategory),
    [activeCategory],
  );

  /** Índice do melhor valor da linha; -1 quando há empate ou valor não numérico. */
  const getWinner = useCallback((fieldId: string, values: (string | number)[]): number => {
    const parsed = values.map((v) => parseFloat(String(v).replace(',', '.')));
    if (parsed.some(Number.isNaN)) return -1;
    const isLowerBetter = ['consumo_cidade', 'consumo_estrada', 'aceleracao', 'co2'].includes(
      fieldId,
    );
    const best = isLowerBetter ? Math.min(...parsed) : Math.max(...parsed);
    return parsed.filter((p) => p === best).length === 1 ? parsed.indexOf(best) : -1;
  }, []);

  const colFlex = selectedVehicles.length === 2 ? 1 : 0.72;

  return (
    <Screen>
      <ScreenHeader
        onBack={() => navigation?.goBack()}
        eyebrow="Análise competitiva"
        title="Comparar"
        subtitle={`${selectedVehicles.length} veículos lado a lado`}
        actions={
          <PressableScale
            onPress={() => setHighlightWinner((v) => !v)}
            scaleTo={0.92}
            accessibilityRole="switch"
            accessibilityState={{ checked: highlightWinner }}
            accessibilityLabel="Destacar melhor valor"
            style={[styles.toggle, highlightWinner && styles.toggleActive]}
          >
            <Icon
              name="spark"
              size={11}
              color={highlightWinner ? theme.brand[900] : theme.colors.onDarkMuted}
            />
            <Txt
              variant="micro"
              color={highlightWinner ? theme.brand[900] : theme.colors.onDarkMuted}
              style={{ fontFamily: theme.fonts.semibold, fontSize: 10 }}
            >
              Destaques
            </Txt>
          </PressableScale>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[4]}
        contentContainerStyle={{ paddingTop: theme.space[4] }}
      >
        {/* 0 — aviso de dados de demonstração */}
        <View style={styles.section}>
          <Callout tone="warning" title="Dados de demonstração">
            Os números abaixo são de exemplo. O comparativo com as suas pesquisas reais entra
            quando o backend expuser o endpoint de comparação.
          </Callout>
        </View>

        {/* 1 — seleção de veículos */}
        <View style={styles.section}>
          <Txt variant="label" tone="muted" uppercase style={{ marginBottom: theme.space[3] }}>
            Veículos analisados
          </Txt>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.bleed}
            contentContainerStyle={styles.bleedContent}
          >
            {COMPARE_MOCK_VEHICLES.map((vehicle) => {
              const selected = selectedVehicles.some((v) => v.id === vehicle.id);
              return (
                <PressableScale
                  key={vehicle.id}
                  onPress={() => toggleVehicle(vehicle)}
                  scaleTo={0.94}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <View
                    style={[
                      styles.chipDot,
                      { backgroundColor: selected ? vehicle.brandColor : theme.ink[200] },
                    ]}
                  />
                  <Txt variant="micro" style={{ fontFamily: theme.fonts.semibold }} numberOfLines={1}>
                    {vehicle.brand} {vehicle.model}
                  </Txt>
                  {selected ? <Icon name="check" size={9} color={theme.brand[600]} /> : null}
                </PressableScale>
              );
            })}
          </ScrollView>
        </View>

        {/* 2 — cards com foto */}
        <View style={[styles.section, styles.cardsRow]}>
          {selectedVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </View>

        {/* 3 — avaliação por categoria */}
        <View style={styles.section}>
          <Card>
            <Txt variant="label" tone="muted" uppercase style={{ marginBottom: theme.space[4] }}>
              Avaliação por categoria
            </Txt>
            {['Motor', 'Segurança', 'Tecnologia', 'Conforto', 'Custo-benefício'].map((cat) => (
              <View key={cat} style={styles.scoreRow}>
                <Txt variant="micro" tone="muted" style={styles.scoreLabel} numberOfLines={1}>
                  {cat}
                </Txt>
                <View style={{ flex: 1, gap: 5 }}>
                  {selectedVehicles.map((v) => {
                    const score = v.categoryScores[cat] ?? 0;
                    return (
                      <View key={v.id} style={styles.scoreBarRow}>
                        <View style={styles.scoreTrack}>
                          <View
                            style={{
                              width: `${score}%`,
                              height: '100%',
                              borderRadius: 3,
                              backgroundColor: v.brandColor,
                            }}
                          />
                        </View>
                        <Txt
                          variant="micro"
                          style={{ fontFamily: theme.fonts.semibold, width: 22, fontSize: 10 }}
                        >
                          {score}
                        </Txt>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* 4 — filtro de categorias (fica fixo ao rolar) */}
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
            {COMPARE_SPEC_CATEGORIES.map((cat) => (
              <FilterChip
                key={cat.id}
                label={cat.name}
                category={cat.name}
                active={activeCategory === cat.id}
                onPress={() => setActiveCategory(cat.id)}
              />
            ))}
          </ScrollView>
          <View style={styles.stickyHeader}>
            <Txt variant="micro" tone="faint" uppercase style={styles.specLabelCol}>
              Especificação
            </Txt>
            {selectedVehicles.map((v) => (
              <View key={v.id} style={{ flex: colFlex, alignItems: 'center' }}>
                <Txt
                  variant="micro"
                  color={v.brandColor}
                  style={{ fontFamily: theme.fonts.bold, fontSize: 10 }}
                  numberOfLines={1}
                >
                  {v.brand}
                </Txt>
                <Txt variant="micro" tone="faint" numberOfLines={1} style={{ fontSize: 9 }}>
                  {v.model}
                </Txt>
              </View>
            ))}
          </View>
        </View>

        {/* 5+ — tabelas por categoria */}
        {visibleCategories.map((category) => {
          const identity = categoryIdentity(category.name);
          return (
          <View key={category.id} style={styles.specSection}>
            <View style={styles.specHead}>
              <View style={[styles.specHeadIcon, { backgroundColor: withAlpha(identity.color, 0.12) }]}>
                <Icon name={identity.icon} size={12} color={identity.color} />
              </View>
              <Txt variant="captionStrong">{category.name}</Txt>
            </View>

            <Card padding={0} style={{ overflow: 'hidden' }}>
              {category.fields.map((field, index) => {
                const values = selectedVehicles.map((v) => v.specs[field.id] ?? '—');
                const winnerIdx = highlightWinner ? getWinner(field.id, values) : -1;
                return (
                  <View
                    key={field.id}
                    style={[
                      styles.specRow,
                      index % 2 === 1 && { backgroundColor: theme.ink[25] },
                      index === category.fields.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <Txt variant="micro" tone="muted" style={styles.specLabelCol} numberOfLines={3}>
                      {field.label}
                    </Txt>
                    {values.map((val, i) => {
                      const isWinner = winnerIdx === i;
                      const empty = val === '—';
                      // Vários valores do mock já trazem a unidade embutida
                      // ("177 cv (E) / 169 cv (G)"). Sem esta checagem saía
                      // "177 cv (E) / 169 cv (G) cv".
                      const showUnit =
                        !!field.unit &&
                        !empty &&
                        !String(val).toLowerCase().includes(field.unit.toLowerCase());
                      return (
                        <View
                          key={`${field.id}-${i}`}
                          style={[
                            styles.specValue,
                            { flex: colFlex },
                            isWinner && styles.specValueWinner,
                          ]}
                        >
                          <Txt
                            variant="micro"
                            tone={empty ? 'faint' : 'default'}
                            numberOfLines={3}
                            center
                            style={{
                              fontFamily: isWinner ? theme.fonts.bold : theme.fonts.medium,
                              fontSize: 11,
                            }}
                          >
                            {val}
                            {showUnit ? ` ${field.unit}` : ''}
                          </Txt>
                          {isWinner ? (
                            <Icon name="spark" size={8} color={theme.colors.success} />
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </Card>
          </View>
          );
        })}

        <BottomInset extra={theme.space[6]} />
      </ScrollView>
    </Screen>
  );
};

/* ── Peças ───────────────────────────────────────────────────────────────── */

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
      {identity ? (
        <Icon name={identity.icon} size={10} color={active ? '#FFFFFF' : color} />
      ) : null}
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

const VehicleCard: React.FC<{ vehicle: CompareVehicle }> = ({ vehicle }) => (
  <Card padding={0} variant="elevated" style={styles.vehicleCard}>
    <View style={[styles.vehicleAccent, { backgroundColor: vehicle.brandColor }]} />
    <View style={styles.vehicleImageWrap}>
      <Image source={{ uri: vehicle.imageUrl }} style={styles.vehicleImage} resizeMode="cover" />
      <View style={[styles.vehicleBrand, { backgroundColor: vehicle.brandColor }]}>
        <Txt variant="micro" tone="inverse" style={{ fontFamily: theme.fonts.bold, fontSize: 9 }}>
          {vehicle.brand.toUpperCase()}
        </Txt>
      </View>
    </View>

    <View style={styles.vehicleInfo}>
      <Txt variant="captionStrong" numberOfLines={1}>
        {vehicle.model}
      </Txt>
      <Txt variant="micro" tone="faint" numberOfLines={1}>
        {vehicle.version}
      </Txt>
      <View style={styles.vehicleMeta}>
        <View style={styles.scorePill}>
          <Icon name="confidence" size={8} color={theme.brand[700]} />
          <Txt
            variant="micro"
            tone="brand"
            style={{ fontFamily: theme.fonts.bold, fontSize: 9 }}
          >
            {vehicle.aiScore}%
          </Txt>
        </View>
        <Txt variant="micro" tone="faint" style={{ fontSize: 9 }}>
          {vehicle.totalFields} campos
        </Txt>
      </View>
      <Txt variant="captionStrong" tone="brand" numberOfLines={1} style={{ marginTop: 4 }}>
        {vehicle.priceFrom}
      </Txt>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: theme.space[4],
    marginBottom: theme.space[5],
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
  vehicleImageWrap: {
    height: 84,
    backgroundColor: theme.ink[50],
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  vehicleBrand: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.xs,
  },
  vehicleInfo: {
    padding: theme.space[3],
    gap: 1,
  },
  vehicleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radii.full,
    backgroundColor: theme.brand[50],
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    marginBottom: theme.space[3],
  },
  scoreLabel: {
    width: 88,
  },
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
  },
  scoreTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.ink[100],
    overflow: 'hidden',
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
    paddingBottom: theme.space[3],
    alignItems: 'center',
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
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.card,
  },
  filterChipActive: {
    backgroundColor: theme.brand[700],
    borderColor: theme.brand[700],
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
  specLabelCol: {
    flex: 1.2,
    paddingRight: theme.space[2],
  },
  specValue: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: theme.radii.xs,
  },
  specValueWinner: {
    backgroundColor: theme.colors.successBg,
  },
});
