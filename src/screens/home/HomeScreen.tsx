// src/screens/home/HomeScreen.tsx
//
// TELA 02 — HOME
// Cabeçalho Spectrum AI, stats rápidas, pesquisas recentes,
// FAB "Comparar veículos" e bottom nav.
//
// Dados:
//   - Perfil do usuário: vem do AuthContext (preenchido no login).
//   - Pesquisas recentes: vêm de GET /v1/searches (paginado).
//   - Stats rápidas: ainda mockadas (backend não expõe /users/me/stats).

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueries } from '@tanstack/react-query';
import { theme } from '../../styles/theme';
import { SearchCard } from '../../components/SearchCard';
import { StatsBar } from '../../components/StatsBar';
import { useAuth } from '../../contexts';
import { useRecentSearches } from '../../hooks/useSearches';
import { getSearchResult } from '../../services/searches';
import { MOCK_USER_STATS, type RecentSearch } from '../../mocks/homeData';
import { styles, fabIconStyles } from '../../styles/homeScreen.styles';
import type { SearchSummary } from '../../types/api';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',     key: 'home'     },
  { icon: '🔍', label: 'Pesquisa', key: 'search'   },
  { icon: '📁', label: 'Sessões',  key: 'sessions' },
  { icon: '👤', label: 'Perfil',   key: 'profile'  },
] as const;

type NavKey = typeof NAV_ITEMS[number]['key'];

interface Props {
  navigation?: any;
}

const initialsFromName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0]?.[0]?.toUpperCase() ?? '?';
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
};

const relativeTime = (iso: string | null): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} d`;
  return date.toLocaleDateString();
};

const mapStatus = (status: SearchSummary['status']): RecentSearch['status'] => {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'FAILED') return 'error';
  return 'in_progress';
};

/**
 * Conta recursivamente os campos folha do JSON de specs.
 * Ignora a chave `sources` — mesma lógica do backend (SearchProcessor#countLeafFields).
 */
const countLeafFields = (node: unknown): number => {
  if (node == null) return 0;
  if (typeof node !== 'object') return 1;
  if (Array.isArray(node)) {
    return node.reduce<number>((sum, item) => sum + countLeafFields(item), 0);
  }
  let count = 0;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === 'sources') continue;
    count += countLeafFields(value);
  }
  return count;
};

const summaryToCard = (item: SearchSummary, totalFields: number): RecentSearch => ({
  id: item.searchId,
  brand: item.vehicle?.brand ?? '',
  model: item.vehicle?.model ?? '',
  version: item.vehicle?.trim ?? '',
  categories: [],
  totalFields,
  sourceTag: 'Oficial',
  createdAt: item.completedAt ?? new Date().toISOString(),
  relativeTime: relativeTime(item.completedAt),
  status: mapStatus(item.status),
});

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [activeNav, setActiveNav] = useState<NavKey>('home');
  const { user, signOut } = useAuth();
  const recentSearchesQuery = useRecentSearches({ page: 0, size: 10 });

  const displayName = user?.name ?? 'usuário';
  const firstName = displayName.split(' ')[0] ?? displayName;
  const initials = initialsFromName(displayName);

  // Exclui pesquisas FAILED do histórico exibido — usuário pediu para esconder.
  const visibleSummaries = useMemo(
    () => (recentSearchesQuery.data?.content ?? []).filter((s) => s.status !== 'FAILED'),
    [recentSearchesQuery.data],
  );

  // Para cada pesquisa concluída, busca o /result para contar campos reais.
  // SearchSummary não traz `specs`, então essa segunda chamada é necessária —
  // staleTime longo + cache do React Query mitigam o custo de N requests.
  const completedSummaries = useMemo(
    () => visibleSummaries.filter((s) => s.status === 'COMPLETED'),
    [visibleSummaries],
  );

  const resultQueries = useQueries({
    queries: completedSummaries.map((s) => ({
      queryKey: ['searches', 'result', s.searchId] as const,
      queryFn: () => getSearchResult(s.searchId),
      staleTime: 1000 * 60 * 60,
    })),
  });

  const fieldCountById = useMemo(() => {
    const map: Record<string, number> = {};
    resultQueries.forEach((q, i) => {
      const summary = completedSummaries[i];
      if (q.data?.specs && summary) {
        map[summary.searchId] = countLeafFields(q.data.specs);
      }
    });
    return map;
    // resultQueries é recriado a cada render — comparamos pelos data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSummaries, resultQueries.map((q) => q.data).join('|')]);

  const cards = useMemo(
    () => visibleSummaries.map((s) => summaryToCard(s, fieldCountById[s.searchId] ?? 0)),
    [visibleSummaries, fieldCountById],
  );

  const handleSearchPress = useCallback(
    (item: RecentSearch) => {
      navigation?.navigate('Result', { searchId: item.id });
    },
    [navigation],
  );

  const handleFABComparator = useCallback(() => {
    navigation?.navigate('Compare');
  }, [navigation]);

  const handleNavPress = useCallback(
    (key: NavKey) => {
      setActiveNav(key);
      if (key === 'profile') {
        Alert.alert('Sair', 'Deseja encerrar a sessão?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
        ]);
        return;
      }
      if (key !== 'home') {
        Alert.alert('Em breve', `A aba "${key}" será implementada nas próximas sprints.`);
      }
    },
    [signOut],
  );

  const stats = [
    { label: 'Pesquisas', value: MOCK_USER_STATS.totalSearches, emoji: '🔍' },
    { label: 'Campos',    value: MOCK_USER_STATS.totalFields,   emoji: '📊' },
    { label: 'Comparações', value: MOCK_USER_STATS.comparisons, emoji: '⚖️' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Olá, {firstName}!</Text>
        </View>

        <TouchableOpacity
          style={styles.avatar}
          onPress={() => handleNavPress('profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/spectrum-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StatsBar stats={stats} />

        <TouchableOpacity
          style={styles.newSearchBtn}
          onPress={() => navigation?.navigate('Search')}
          activeOpacity={0.85}
        >
          <Text style={styles.newSearchPlus}>+</Text>
          <Text style={styles.newSearchLabel}>Nova pesquisa</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Pesquisas recentes</Text>
          <TouchableOpacity onPress={() => handleNavPress('sessions')}>
            <Text style={styles.sectionAction}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        {recentSearchesQuery.isLoading ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : recentSearchesQuery.error ? (
          <Text style={{ color: '#c0392b', textAlign: 'center', paddingVertical: 16 }}>
            Não foi possível carregar as pesquisas recentes.
          </Text>
        ) : cards.length === 0 ? (
          <Text
            style={{
              color: theme.colors.textLight,
              textAlign: 'center',
              paddingVertical: 16,
            }}
          >
            Nenhuma pesquisa ainda. Toque em "Nova pesquisa" para começar.
          </Text>
        ) : (
          cards.map((item) => (
            <SearchCard key={item.id} item={item} onPress={handleSearchPress} />
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.fabWrapper} pointerEvents="box-none">
        <View style={styles.fabTooltipRow}>
          <View style={styles.fabTooltip}>
            <Text style={styles.fabTooltipText}>Comparar veículos</Text>
          </View>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleFABComparator}
            activeOpacity={0.85}
          >
            <FABIcon />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomNav}>
        {NAV_ITEMS.map(({ icon, label, key }) => {
          const isActive = activeNav === key;
          return (
            <TouchableOpacity
              key={key}
              style={styles.navItem}
              onPress={() => handleNavPress(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{icon}</Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
              {isActive && <View style={styles.navIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const FABIcon: React.FC = () => (
  <View style={fabIconStyles.container}>
    <View style={fabIconStyles.carA}>
      <View style={fabIconStyles.carBody} />
      <View style={fabIconStyles.wheelRow}>
        <View style={fabIconStyles.wheel} />
        <View style={fabIconStyles.wheel} />
      </View>
    </View>
    <Text style={fabIconStyles.arrows}>⇄</Text>
    <View style={fabIconStyles.carB}>
      <View style={[fabIconStyles.carBody, { borderColor: theme.colors.secondary }]} />
      <View style={fabIconStyles.wheelRow}>
        <View style={[fabIconStyles.wheel, { borderColor: theme.colors.secondary }]} />
        <View style={[fabIconStyles.wheel, { borderColor: theme.colors.secondary }]} />
      </View>
    </View>
  </View>
);
