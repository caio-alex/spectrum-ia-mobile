// src/screens/search/CategoriesScreen.tsx
//
// TELA 04 — CATEGORIAS DE PESQUISA
// Fiel ao mockup: header com veículo selecionado, grid 2×3 de categorias
// com toggle de seleção, contador de categorias e botão "Iniciar pesquisa".
//
// Props recebidas via navigation.params: brand, model, version, year

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { theme } from '../../styles/theme';
import { SEARCH_CATEGORIES, type SearchCategory } from '../../mocks/vehicleData';
import { styles } from '../../styles/categoriesScreen.styles';
// ── Props ─────────────────────────────────────────────────────────────────
interface RouteParams {
  brand: string;
  model: string;
  version: string;
  year?: string;
}

interface Props {
  navigation?: any;
  route?: { params?: RouteParams };
}

// ── Componente principal ─────────────────────────────────────────────────
export const CategoriesScreen: React.FC<Props> = ({ navigation, route }) => {
  const params = route?.params ?? {
    brand: 'Toyota',
    model: 'Corolla Cross',
    version: 'XRE',
    year: '2024',
  };

  const vehicleLabel = `${params.brand} ${params.model} ${params.version}`;

  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Animações escalonadas para os cards
  const cardAnims = useRef(
    SEARCH_CATEGORIES.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = cardAnims.map((anim, i) =>
      Animated.spring(anim, {
        toValue: 1,
        delay: 80 + i * 60,
        tension: 65,
        friction: 10,
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start();
  }, []);

  const toggleCategory = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (selected.size === SEARCH_CATEGORIES.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(SEARCH_CATEGORIES.map((c) => c.id)));
    }
  }, [selected.size]);

  const handleStart = useCallback(() => {
    if (selected.size === 0) return;
    const categories = SEARCH_CATEGORIES
      .filter((c) => selected.has(c.id))
      .map((c) => c.name);

    navigation?.navigate('Processing', {
      ...params,
      categories,
    });
  }, [selected, params, navigation]);

  const canStart = selected.size > 0;
  const allSelected = selected.size === SEARCH_CATEGORIES.length;

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {/* ── HEADER ───────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backVehicle} numberOfLines={1}>
            {vehicleLabel}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>O que pesquisar?</Text>
      </View>

      {/* ── CORPO ────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Instrução + Selecionar todos */}
        <View style={styles.topRow}>
          <Text style={styles.instruction}>
            Selecione as categorias de especificações desejadas:
          </Text>
          <TouchableOpacity
            style={[styles.selectAllBtn, allSelected && styles.selectAllBtnActive]}
            onPress={selectAll}
            activeOpacity={0.7}
          >
            <Text style={[styles.selectAllText, allSelected && styles.selectAllTextActive]}>
              {allSelected ? '✓ Todos' : 'Selecionar todos'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grid de categorias 2×N */}
        <View style={styles.grid}>
          {SEARCH_CATEGORIES.map((cat, i) => {
            const isSelected = selected.has(cat.id);
            return (
              <Animated.View
                key={cat.id}
                style={[
                  styles.cardWrapper,
                  {
                    opacity: cardAnims[i],
                    transform: [
                      {
                        scale: cardAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.88, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <CategoryCard
                  category={cat}
                  selected={isSelected}
                  onPress={() => toggleCategory(cat.id)}
                />
              </Animated.View>
            );
          })}
        </View>

        {/* Info de campos estimados */}
        {selected.size > 0 && (
          <Animated.View style={styles.estimateCard}>
            <Text style={styles.estimateIcon}>📊</Text>
            <View>
              <Text style={styles.estimateTitle}>
                ~{getEstimatedFields(selected)} campos serão pesquisados
              </Text>
              <Text style={styles.estimateSubtitle}>
                {selected.size} {selected.size === 1 ? 'categoria' : 'categorias'} selecionada{selected.size > 1 ? 's' : ''}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Botão iniciar */}
        <TouchableOpacity
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          onPress={handleStart}
          activeOpacity={canStart ? 0.85 : 1}
          disabled={!canStart}
        >
          <Text style={[styles.startBtnText, !canStart && styles.startBtnTextDisabled]}>
            {canStart
              ? `Iniciar pesquisa →`
              : 'Selecione ao menos 1 categoria'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── CategoryCard ─────────────────────────────────────────────────────────
interface CategoryCardProps {
  category: SearchCategory;
  selected: boolean;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, selected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.93,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
      <TouchableOpacity
        style={[styles.catCard, selected && styles.catCardSelected]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Checkbox indicator */}
        <View style={[styles.catCheck, selected && styles.catCheckSelected]}>
          {selected && <Text style={styles.catCheckMark}>✓</Text>}
        </View>

        {/* Emoji */}
        <Text style={styles.catEmoji}>{category.emoji}</Text>

        {/* Nome */}
        <Text style={[styles.catName, selected && styles.catNameSelected]}>
          {category.name}
        </Text>

        {/* Subtítulo */}
        <Text style={[styles.catSubtitle, selected && styles.catSubtitleSelected]}>
          {category.subtitle}
        </Text>

        {/* Fields count badge */}
        <View style={[styles.catBadge, selected && styles.catBadgeSelected]}>
          <Text style={[styles.catBadgeText, selected && styles.catBadgeTextSelected]}>
            ~{category.estimatedFields} campos
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ── Helper ────────────────────────────────────────────────────────────────
function getEstimatedFields(selected: Set<string>): number {
  return SEARCH_CATEGORIES
    .filter((c) => selected.has(c.id))
    .reduce((sum, c) => sum + c.estimatedFields, 0);
}

// ── Styles ────────────────────────────────────────────────────────────────
