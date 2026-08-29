// src/screens/search/CategoriesScreen.tsx
//
// TELA 04 — CATEGORIAS DE PESQUISA (passo 2 de 4)
//
// Grid de 2 colunas com as 14 categorias mapeadas às chaves do back-end.
// Params via navigation: brand, model, trim, year, sessionId, sessionName.
//
// O resumo do que foi escolhido (quantas categorias, quantos campos estimados)
// desceu para a barra de ação fixa: é a informação que decide o toque, então
// precisa estar junto do botão e não no meio da rolagem.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, withAlpha } from '../../styles/theme';
import { SEARCH_CATEGORIES, type SearchCategory } from '../../mocks/vehicleData';
import {
  Button,
  Icon,
  PressableScale,
  ProgressBar,
  Screen,
  ScreenHeader,
  Stepper,
  Txt,
  categoryIdentity,
} from '../../components/ui';

interface RouteParams {
  brand: string;
  model: string;
  trim: string;
  year: number;
  /** Sessão à qual a pesquisa será vinculada (POST /v1/searches#sessionId). */
  sessionId: string;
  sessionName?: string;
}

interface Props {
  navigation?: any;
  route?: { params?: RouteParams };
}

export const CategoriesScreen: React.FC<Props> = ({ navigation, route }) => {
  const params = route?.params;
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Entrada escalonada dos cards — dá a sensação de que a grade "se monta".
  const cardAnims = useRef(SEARCH_CATEGORIES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      theme.motion.stagger * 0.6,
      cardAnims.map((anim) =>
        Animated.spring(anim, { toValue: 1, useNativeDriver: true, ...theme.motion.spring }),
      ),
    ).start();
  }, [cardAnims]);

  const toggleCategory = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allSelected = selected.size === SEARCH_CATEGORIES.length;

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === SEARCH_CATEGORIES.length
        ? new Set()
        : new Set(SEARCH_CATEGORIES.map((c) => c.id)),
    );
  }, []);

  const estimatedTotal = useMemo(
    () =>
      SEARCH_CATEGORIES.filter((c) => selected.has(c.id)).reduce(
        (sum, c) => sum + c.estimatedFields,
        0,
      ),
    [selected],
  );

  const handleStart = useCallback(() => {
    if (!params || selected.size === 0) return;

    const selectedCategories = SEARCH_CATEGORIES.filter((c) => selected.has(c.id));
    navigation?.navigate('Processing', {
      brand: params.brand,
      model: params.model,
      trim: params.trim,
      year: params.year,
      categories: selectedCategories.map((c) => c.name),
      // enviado ao back-end (POST /v1/searches#categories)
      categoryKeys: selectedCategories.map((c) => c.backendKey),
      sessionId: params.sessionId,
      sessionName: params.sessionName,
    });
  }, [selected, params, navigation]);

  if (!params) {
    // Sem parâmetros válidos não há como prosseguir — volta para SearchScreen.
    navigation?.goBack?.();
    return null;
  }

  const vehicleLabel = `${params.brand} ${params.model} ${params.trim}`.trim();
  const canStart = selected.size > 0;

  return (
    <Screen>
      <ScreenHeader
        onBack={() => navigation?.goBack()}
        eyebrow="Passo 2 de 4"
        title="O que pesquisar?"
        subtitle={vehicleLabel}
      >
        <Stepper
          onDark
          steps={['Veículo', 'Categorias', 'Pesquisa', 'Resultado']}
          current={1}
          style={{ marginTop: theme.space[5] }}
        />
      </ScreenHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Txt variant="caption" tone="muted" style={{ flex: 1 }}>
            Escolha as categorias que a IA deve analisar.
          </Txt>
          <PressableScale
            onPress={toggleAll}
            scaleTo={0.94}
            accessibilityRole="button"
            style={[styles.selectAll, allSelected && styles.selectAllActive]}
          >
            <Icon
              name={allSelected ? 'checkAll' : 'add'}
              size={10}
              color={allSelected ? '#FFFFFF' : theme.brand[700]}
            />
            <Txt
              variant="micro"
              color={allSelected ? '#FFFFFF' : theme.brand[700]}
              style={{ fontFamily: theme.fonts.semibold }}
            >
              {allSelected ? 'Limpar' : 'Todas'}
            </Txt>
          </PressableScale>
        </View>

        <View style={styles.grid}>
          {SEARCH_CATEGORIES.map((cat, i) => (
            <Animated.View
              key={cat.id}
              style={[
                styles.cell,
                {
                  opacity: cardAnims[i],
                  transform: [
                    {
                      scale: cardAnims[i].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <CategoryCard
                category={cat}
                selected={selected.has(cat.id)}
                onPress={() => toggleCategory(cat.id)}
              />
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space[3] }]}>
        {canStart ? (
          <View style={styles.summary}>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.summaryRow}>
                <Txt variant="captionStrong">
                  {selected.size} de {SEARCH_CATEGORIES.length}{' '}
                  {selected.size === 1 ? 'categoria' : 'categorias'}
                </Txt>
                <Txt variant="micro" tone="accent" style={{ fontFamily: theme.fonts.semibold }}>
                  ~{estimatedTotal} campos
                </Txt>
              </View>
              <ProgressBar progress={selected.size / SEARCH_CATEGORIES.length} height={4} />
            </View>
          </View>
        ) : null}

        <Button
          label={canStart ? 'Iniciar pesquisa' : 'Selecione ao menos 1 categoria'}
          size="lg"
          icon={canStart ? 'ai' : undefined}
          onPress={handleStart}
          disabled={!canStart}
        />
      </View>
    </Screen>
  );
};

/* ── CategoryCard ────────────────────────────────────────────────────────── */

const CategoryCard: React.FC<{
  category: SearchCategory;
  selected: boolean;
  onPress: () => void;
}> = ({ category, selected, onPress }) => {
  // Cada categoria tem cor própria — selecionada, ela toma conta do bloco
  // inteiro (ícone sólido, moldura e halo). É o que devolve vida à grade e faz
  // a escolha ser reconhecida de relance, sem reler o texto.
  const { icon, color } = categoryIdentity(category.name);

  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.95}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={category.name}
      style={[
        styles.card,
        selected && {
          borderColor: color,
          backgroundColor: withAlpha(color, 0.06),
          boxShadow: `0px 6px 16px ${withAlpha(color, 0.22)}`,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View
          style={[
            styles.cardIcon,
            { backgroundColor: selected ? color : withAlpha(color, 0.12) },
          ]}
        >
          <Icon name={icon} size={16} color={selected ? '#FFFFFF' : color} />
        </View>
        <View
          style={[
            styles.checkbox,
            selected && { backgroundColor: color, borderColor: color },
          ]}
        >
          {selected ? <Icon name="check" size={9} color="#FFFFFF" /> : null}
        </View>
      </View>

      <Txt variant="captionStrong" numberOfLines={2} style={{ marginTop: theme.space[3] }}>
        {category.name}
      </Txt>
      <Txt variant="micro" tone="faint" numberOfLines={2} style={{ marginTop: 2, flex: 1 }}>
        {category.subtitle}
      </Txt>

      <Txt
        variant="micro"
        color={selected ? color : theme.colors.textMuted}
        style={{ fontFamily: theme.fonts.semibold, marginTop: theme.space[2], fontSize: 10 }}
      >
        ~{category.estimatedFields} campos
      </Txt>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  body: {
    padding: theme.space[4],
    paddingTop: theme.space[5],
    paddingBottom: theme.space[6],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    marginBottom: theme.space[4],
  },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    borderColor: theme.brand[100],
    backgroundColor: theme.brand[50],
  },
  selectAllActive: {
    backgroundColor: theme.brand[700],
    borderColor: theme.brand[700],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[2],
  },
  cell: {
    width: '48.4%',
  },
  card: {
    minHeight: 148,
    borderRadius: theme.radii.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.card,
    padding: theme.space[3],
    ...theme.shadow.xs,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.radii.full,
    borderWidth: 1.5,
    borderColor: theme.ink[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: theme.space[4],
    paddingTop: theme.space[3],
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    gap: theme.space[3],
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
