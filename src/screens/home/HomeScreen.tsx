// src/screens/home/HomeScreen.tsx
//
// TELA 02 — HOME
// Fiel ao mockup: cabeçalho Spectrum AI, stats rápidas, pesquisas recentes,
// FAB "Comparar veículos" e bottom nav.
//
// Dados: todos via mocks em /src/mocks/homeData.ts
// Integração real: substituir MOCK_* pelos hooks/queries do @tanstack/react-query
// apontando para GET /api/v1/searches e GET /api/v1/users/me

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { theme } from '../../styles/theme';
import { SearchCard } from '../../components/SearchCard';
import { StatsBar } from '../../components/StatsBar';
import {
  MOCK_USER,
  MOCK_RECENT_SEARCHES,
  MOCK_USER_STATS,
  type RecentSearch,
} from '../../mocks/homeData';

// ── Constantes de navegação (bottom nav) ─────────────────────────────────
const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',     key: 'home'     },
  { icon: '🔍', label: 'Pesquisa', key: 'search'   },
  { icon: '📁', label: 'Sessões',  key: 'sessions' },
  { icon: '👤', label: 'Perfil',   key: 'profile'  },
] as const;

type NavKey = typeof NAV_ITEMS[number]['key'];

// ── Props ────────────────────────────────────────────────────────────────
interface Props {
  navigation?: any; // Tipado como 'any' até adicionar @react-navigation/types
}

// ────────────────────────────────────────────────────────────────────────────
export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [activeNav, setActiveNav] = useState<NavKey>('home');

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleNewSearch = useCallback(() => {
    // TODO: navigation.navigate('NewSearch') quando a tela 03 estiver pronta
    Alert.alert('Nova pesquisa', 'Tela em construção (Tela 03 do mockup).');
  }, []);

  const handleSearchPress = useCallback((item: RecentSearch) => {
    // TODO: navigation.navigate('SearchResult', { searchId: item.id })
    Alert.alert(
      `${item.brand} ${item.model} ${item.version}`,
      `${item.totalFields} campos analisados\nStatus: ${item.status}`,
    );
  }, []);

  const handleFABComparator = useCallback(() => {
    // TODO: navigation.navigate('Comparator')
    Alert.alert('Comparador', 'Tela em construção (Fluxo comparador do mockup).');
  }, []);

  const handleNavPress = useCallback((key: NavKey) => {
    setActiveNav(key);
    if (key !== 'home') {
      Alert.alert('Em breve', `A aba "${key}" será implementada nas próximas sprints.`);
    }
  }, []);

  // ── Stats para a StatsBar ─────────────────────────────────────────────
  const stats = [
    { label: 'Pesquisas', value: MOCK_USER_STATS.totalSearches, emoji: '🔍' },
    { label: 'Campos',    value: MOCK_USER_STATS.totalFields,   emoji: '📊' },
    { label: 'Comparações', value: MOCK_USER_STATS.comparisons, emoji: '⚖️' },
  ];

  // ─────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.colors.primary}
      />

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>
            Olá, {MOCK_USER.name.split(' ')[0]} 👋
          </Text>
          <Text style={styles.headerLogo}>
            Spectrum
            <Text style={styles.headerLogoAccent}> AI</Text>
          </Text>
        </View>

        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => handleNavPress('profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{MOCK_USER.initials}</Text>
        </TouchableOpacity>
      </View>

      {/* ── CORPO PRINCIPAL ─────────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats rápidas */}
        <StatsBar stats={stats} />

        {/* CTA – Nova pesquisa */}
        <TouchableOpacity
          style={styles.newSearchBtn}
          onPress={handleNewSearch}
          activeOpacity={0.85}
        >
          <Text style={styles.newSearchPlus}>+</Text>
          <Text style={styles.newSearchLabel}>Nova pesquisa</Text>
        </TouchableOpacity>

        {/* Seção: Pesquisas recentes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Pesquisas recentes</Text>
          <TouchableOpacity onPress={() => handleNavPress('sessions')}>
            <Text style={styles.sectionAction}>Ver todas →</Text>
          </TouchableOpacity>
        </View>

        {MOCK_RECENT_SEARCHES.map((item) => (
          <SearchCard
            key={item.id}
            item={item}
            onPress={handleSearchPress}
          />
        ))}

        {/* Padding extra para não ficar embaixo do bottom nav + FAB */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB – Comparador ────────────────────────────────────────── */}
      {/* Posicionado absoluto acima da bottom nav, alinhado à direita */}
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
            {/* Ícone de comparação — dois retângulos com setas */}
            <FABIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BOTTOM NAV ──────────────────────────────────────────────── */}
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
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {label}
              </Text>
              {isActive && <View style={styles.navIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

// ── FAB Icon Component ────────────────────────────────────────────────────
// Representa dois retângulos (carros) comparando — sem dependência de SVG lib
const FABIcon: React.FC = () => (
  <View style={fabIconStyles.container}>
    {/* Carro A */}
    <View style={fabIconStyles.carA}>
      <View style={fabIconStyles.carBody} />
      <View style={fabIconStyles.wheelRow}>
        <View style={fabIconStyles.wheel} />
        <View style={fabIconStyles.wheel} />
      </View>
    </View>
    {/* Setas */}
    <Text style={fabIconStyles.arrows}>⇄</Text>
    {/* Carro B (accent) */}
    <View style={fabIconStyles.carB}>
      <View style={[fabIconStyles.carBody, { borderColor: theme.colors.secondary }]} />
      <View style={fabIconStyles.wheelRow}>
        <View style={[fabIconStyles.wheel, { borderColor: theme.colors.secondary }]} />
        <View style={[fabIconStyles.wheel, { borderColor: theme.colors.secondary }]} />
      </View>
    </View>
  </View>
);

const fabIconStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  carA:      { alignItems: 'center', gap: 2 },
  carB:      { alignItems: 'center', gap: 2 },
  carBody: {
    width: 14,
    height: 8,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  wheelRow:  { flexDirection: 'row', gap: 5 },
  wheel: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  arrows: { color: '#fff', fontSize: 12, lineHeight: 14 },
});

// ── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  // Header
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerGreeting: {
    fontSize: 12,
    color: 'rgba(131,192,255,0.85)',
    fontWeight: '400',
    marginBottom: 2,
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerLogoAccent: {
    color: theme.colors.secondary,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.secondaryAlpha35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(131,192,255,0.4)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Scroll
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },

  // Nova pesquisa
  newSearchBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  newSearchPlus: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '300',
  },
  newSearchLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  // Seção
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionAction: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // FAB
  fabWrapper: {
    position: 'absolute',
    right: 16,
    bottom: 68, // acima da bottom nav (52px) + margem
    alignItems: 'flex-end',
  },
  fabTooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabTooltip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  fabTooltipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.45,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: theme.colors.textLight,
    letterSpacing: 0.1,
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  navIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});