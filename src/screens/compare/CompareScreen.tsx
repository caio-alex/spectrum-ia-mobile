// src/screens/compare/CompareScreen.tsx
//
// TELA — COMPARAÇÃO DE VEÍCULOS
// Exibe cards dos veículos analisados com foto via NHTSA + Car Query API (gratuitas)
// e comparação lado a lado de todas as especificações por categoria.
//
// Integração real futura:
//   - Fotos: https://www.carqueryapi.com/ ou https://car-api.io (plano gratuito)
//   - Specs: GET /api/v1/searches/:id/result

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
  FlatList,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { theme } from '../../styles/theme';
import { styles } from '../../styles/compareScreen.styles';
import {
  COMPARE_MOCK_VEHICLES,
  COMPARE_SPEC_CATEGORIES,
  type CompareVehicle,
} from '../../mocks/compareData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  navigation?: any;
  route?: { params?: { vehicleIds?: string[] } };
}

// ── Componente principal ──────────────────────────────────────────────────
export const CompareScreen: React.FC<Props> = ({ navigation, route }) => {
  const passedIds = route?.params?.vehicleIds;

  // Usa os veículos passados via params ou exibe todos os analisados
  const [selectedVehicles, setSelectedVehicles] = useState<CompareVehicle[]>(
    passedIds
      ? COMPARE_MOCK_VEHICLES.filter((v) => passedIds.includes(v.id))
      : COMPARE_MOCK_VEHICLES.slice(0, 2)
  );

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [highlightWinner, setHighlightWinner] = useState(true);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleVehicle = useCallback((vehicle: CompareVehicle) => {
    setSelectedVehicles((prev) => {
      const isSelected = prev.find((v) => v.id === vehicle.id);
      if (isSelected) {
        if (prev.length <= 2) return prev;
        return prev.filter((v) => v.id !== vehicle.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, vehicle];
    });
  }, []);

  // Filtra categorias conforme seleção
  const visibleCategories =
    activeCategory === 'all'
      ? COMPARE_SPEC_CATEGORIES
      : COMPARE_SPEC_CATEGORIES.filter((c) => c.id === activeCategory);

  // Determina vencedor por campo (valor mais alto = melhor, exceto consumo)
  const getWinner = (fieldId: string, values: (string | number)[]): number => {
    const parsed = values.map((v) => parseFloat(String(v).replace(',', '.')));
    if (parsed.some(isNaN)) return -1;
    const isLowerBetter = ['consumo_cidade', 'consumo_estrada', 'aceleracao', 'co2'].includes(fieldId);
    const best = isLowerBetter ? Math.min(...parsed) : Math.max(...parsed);
    const idx = parsed.indexOf(best);
    return parsed.filter((p) => p === best).length === 1 ? idx : -1;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {/* ── HEADER ───────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Comparar Veículos</Text>
          <Text style={styles.headerSub}>{selectedVehicles.length} selecionados</Text>
        </View>
        <TouchableOpacity
          style={[styles.highlightToggle, highlightWinner && styles.highlightToggleActive]}
          onPress={() => setHighlightWinner(!highlightWinner)}
          activeOpacity={0.7}
        >
          <Text style={[styles.highlightToggleText, highlightWinner && styles.highlightToggleTextActive]}>
            🏆
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>

          {/* ── SELEÇÃO DE VEÍCULOS ──────────────────────────────── */}
          <View style={styles.vehicleSelector}>
            <Text style={styles.sectionLabel}>VEÍCULOS ANALISADOS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vehicleListContent}>
              {COMPARE_MOCK_VEHICLES.map((vehicle) => {
                const isSelected = !!selectedVehicles.find((v) => v.id === vehicle.id);
                return (
                  <VehicleChip
                    key={vehicle.id}
                    vehicle={vehicle}
                    selected={isSelected}
                    onPress={() => toggleVehicle(vehicle)}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* ── CARDS DE VEÍCULOS COM FOTOS ──────────────────────── */}
          <View style={styles.vehicleCardsRow}>
            {selectedVehicles.map((vehicle, idx) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                index={idx}
                imageLoading={imageLoading[vehicle.id]}
                onImageLoadStart={() => setImageLoading((p) => ({ ...p, [vehicle.id]: true }))}
                onImageLoadEnd={() => setImageLoading((p) => ({ ...p, [vehicle.id]: false }))}
              />
            ))}
          </View>

          {/* ── SCORE GERAL ──────────────────────────────────────── */}
          <ScoreBar vehicles={selectedVehicles} />

          {/* ── FILTRO DE CATEGORIAS (sticky) ────────────────────── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryFilterContent}
            style={styles.categoryFilter}
          >
            <TouchableOpacity
              style={[styles.categoryChip, activeCategory === 'all' && styles.categoryChipActive]}
              onPress={() => setActiveCategory('all')}
            >
              <Text style={[styles.categoryChipText, activeCategory === 'all' && styles.categoryChipTextActive]}>
                Todos
              </Text>
            </TouchableOpacity>
            {COMPARE_SPEC_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, activeCategory === cat.id && styles.categoryChipActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <Text style={[styles.categoryChipText, activeCategory === cat.id && styles.categoryChipTextActive]}>
                  {cat.emoji} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── TABELAS DE SPECS POR CATEGORIA ───────────────────── */}
          {visibleCategories.map((category) => (
            <View key={category.id} style={styles.specSection}>
              <View style={styles.specSectionHeader}>
                <Text style={styles.specSectionEmoji}>{category.emoji}</Text>
                <Text style={styles.specSectionTitle}>{category.name}</Text>
              </View>

              {category.fields.map((field) => {
                const values = selectedVehicles.map((v) => v.specs[field.id] ?? '—');
                const winnerIdx = highlightWinner ? getWinner(field.id, values) : -1;

                return (
                  <SpecRow
                    key={field.id}
                    label={field.label}
                    unit={field.unit}
                    values={values}
                    winnerIdx={winnerIdx}
                    vehicleCount={selectedVehicles.length}
                    confidences={selectedVehicles.map((v) => v.specConfidence[field.id] ?? 'medium')}
                  />
                );
              })}
            </View>
          ))}

          {/* ── BOTÃO COMPRAR ─────────────────────────────────────── */}
          <View style={styles.buySection}>
            <Text style={styles.buySectionTitle}>Pronto para decidir?</Text>
            <Text style={styles.buySectionSub}>
              Veja ofertas disponíveis nas concessionárias Ford parceiras
            </Text>
            {selectedVehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[styles.buyBtn, { borderColor: vehicle.brandColor }]}
                onPress={() => navigation?.navigate('DealerSearch', { vehicleId: vehicle.id })}
                activeOpacity={0.8}
              >
                <View style={[styles.buyBtnIcon, { backgroundColor: vehicle.brandColor + '15' }]}>
                  <Text style={styles.buyBtnEmoji}>🏪</Text>
                </View>
                <View style={styles.buyBtnContent}>
                  <Text style={styles.buyBtnModel}>{vehicle.brand} {vehicle.model}</Text>
                  <Text style={styles.buyBtnInfo}>Ver concessionárias • A partir de {vehicle.priceFrom}</Text>
                </View>
                <Text style={styles.buyBtnArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

// ── VehicleChip ────────────────────────────────────────────────────────────
const VehicleChip: React.FC<{
  vehicle: CompareVehicle;
  selected: boolean;
  onPress: () => void;
}> = ({ vehicle, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.vehicleChip, selected && styles.vehicleChipSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {selected && <View style={[styles.vehicleChipDot, { backgroundColor: vehicle.brandColor }]} />}
    <Text style={[styles.vehicleChipText, selected && styles.vehicleChipTextSelected]} numberOfLines={1}>
      {vehicle.brand} {vehicle.model}
    </Text>
    {selected && <Text style={styles.vehicleChipCheck}>✓</Text>}
  </TouchableOpacity>
);

// ── VehicleCard ────────────────────────────────────────────────────────────
const VehicleCard: React.FC<{
  vehicle: CompareVehicle;
  index: number;
  imageLoading?: boolean;
  onImageLoadStart: () => void;
  onImageLoadEnd: () => void;
}> = ({ vehicle, index, imageLoading, onImageLoadStart, onImageLoadEnd }) => (
  <View style={[styles.vehicleCard, { borderTopColor: vehicle.brandColor }]}>
    {/* Foto via API gratuita (Car Image API / Unsplash fallback) */}
    <View style={styles.vehicleImageContainer}>
      {imageLoading && (
        <ActivityIndicator
          style={styles.vehicleImageLoader}
          size="small"
          color={theme.colors.primary}
        />
      )}
      <Image
        source={{ uri: vehicle.imageUrl }}
        style={styles.vehicleImage}
        resizeMode="cover"
        onLoadStart={onImageLoadStart}
        onLoadEnd={onImageLoadEnd}
        defaultSource={require('../../../assets/icon.png')}
      />
      <View style={[styles.vehicleBrandBadge, { backgroundColor: vehicle.brandColor }]}>
        <Text style={styles.vehicleBrandBadgeText}>{vehicle.brand}</Text>
      </View>
    </View>

    {/* Info */}
    <View style={styles.vehicleCardInfo}>
      <Text style={styles.vehicleCardModel} numberOfLines={1}>{vehicle.model}</Text>
      <Text style={styles.vehicleCardVersion} numberOfLines={1}>{vehicle.version}</Text>
      <Text style={styles.vehicleCardYear}>{vehicle.year}</Text>

      {/* Score de confiança da IA */}
      <View style={styles.vehicleScoreRow}>
        <View style={[styles.vehicleScoreBadge, { backgroundColor: getScoreColor(vehicle.aiScore) + '20' }]}>
          <Text style={[styles.vehicleScoreText, { color: getScoreColor(vehicle.aiScore) }]}>
            IA {vehicle.aiScore}%
          </Text>
        </View>
        <Text style={styles.vehicleFieldsCount}>{vehicle.totalFields} campos</Text>
      </View>

      <Text style={styles.vehiclePrice}>{vehicle.priceFrom}</Text>
    </View>
  </View>
);

// ── ScoreBar ────────────────────────────────────────────────────────────────
const ScoreBar: React.FC<{ vehicles: CompareVehicle[] }> = ({ vehicles }) => {
  const categories = ['Motor', 'Segurança', 'Tecnologia', 'Conforto', 'Custo-benefício'];

  return (
    <View style={styles.scoreBarContainer}>
      <Text style={styles.scoreBarTitle}>AVALIAÇÃO IA POR CATEGORIA</Text>
      {categories.map((cat) => (
        <View key={cat} style={styles.scoreBarRow}>
          <Text style={styles.scoreBarLabel}>{cat}</Text>
          <View style={styles.scoreBarBars}>
            {vehicles.map((v, i) => {
              const score = v.categoryScores[cat] ?? 0;
              return (
                <View key={v.id} style={styles.scoreBarItem}>
                  <View style={styles.scoreBarTrack}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        { width: `${score}%`, backgroundColor: v.brandColor },
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreBarValue}>{score}</Text>
                </View>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

// ── SpecRow ────────────────────────────────────────────────────────────────
const SpecRow: React.FC<{
  label: string;
  unit?: string;
  values: (string | number)[];
  winnerIdx: number;
  vehicleCount: number;
  confidences: string[];
}> = ({ label, unit, values, winnerIdx, vehicleCount, confidences }) => {
  const colWidth = vehicleCount === 2 ? '40%' : '30%';

  return (
    <View style={styles.specRow}>
      <Text style={styles.specRowLabel} numberOfLines={2}>{label}</Text>
      <View style={styles.specRowValues}>
        {values.map((val, i) => {
          const isWinner = winnerIdx === i;
          const conf = confidences[i];
          return (
            <View
              key={i}
              style={[
                styles.specRowValue,
                { width: colWidth },
                isWinner && styles.specRowValueWinner,
              ]}
            >
              <Text
                style={[
                  styles.specRowValueText,
                  isWinner && styles.specRowValueTextWinner,
                  val === '—' && styles.specRowValueEmpty,
                ]}
                numberOfLines={2}
              >
                {val}{unit && val !== '—' ? ` ${unit}` : ''}
              </Text>
              {isWinner && <Text style={styles.specWinnerBadge}>🏆</Text>}
              {conf === 'low' && val !== '—' && (
                <Text style={styles.specConfidenceDot}>~</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ── Helper ─────────────────────────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 90) return '#1a6e1a';
  if (score >= 75) return '#0047ab';
  if (score >= 60) return '#c06000';
  return '#c62828';
}
