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
import { useNavigation } from '@react-navigation/native';
import { Image, ImageSourcePropType, ImageStyle } from 'react-native';
import {
  MOCK_USER,
  MOCK_RECENT_SEARCHES,
  MOCK_USER_STATS,
  type RecentSearch,
} from '../../mocks/homeData';
import { styles, fabIconStyles } from '../../styles/homeScreen.styles';

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
    navigation.navigate('Compare')
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
    <View style={styles.logoContainer}>
      <Image
        source={require('../../../assets/spectrum-logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
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
          onPress={() => navigation.navigate('Search')}
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
