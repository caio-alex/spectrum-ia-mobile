// src/screens/home/HomeScreen.tsx
//
// TELA 02 — HOME
// Cabeçalho Spectrum AI, stats rápidas, seletor de sessão, pesquisas recentes,
// FAB "Comparar veículos" e bottom nav.
//
// Dados:
//   - Perfil do usuário: vem do AuthContext (preenchido no login).
//   - Pesquisas recentes: vêm de GET /v1/searches (paginado).
//   - Sessões: GET /v1/sessions, via SessionPickerSheet.
//   - Stats rápidas: ainda mockadas (backend não expõe /users/me/stats).
//
// Toda pesquisa precisa estar vinculada a uma sessão, então "Nova pesquisa"
// só fica ativo depois que uma sessão é escolhida (ou criada) aqui.

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { SearchCard } from '../../components/SearchCard';
import { StatsBar } from '../../components/StatsBar';
import { SelectField } from '../../components/SelectField';
import { SessionPickerSheet } from '../../components/SessionPickerSheet';
import { BottomNav, useBottomNavHandler } from '../../components/BottomNav';
import { useAuth } from '../../contexts';
import { useRecentSearches } from '../../hooks/useSearches';
import { useSearchCards } from '../../hooks/useSearchCards';
import { formatDate } from '../../utils/date';
import { MOCK_USER_STATS, type RecentSearch } from '../../mocks/homeData';
import { styles, fabIconStyles } from '../../styles/homeScreen.styles';
import type { SessionResponse } from '../../services/sessions';

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

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const recentSearchesQuery = useRecentSearches({ page: 0, size: 10 });
  const handleNavPress = useBottomNavHandler(navigation);

  const displayName = user?.name ?? 'usuário';
  const firstName = displayName.split(' ')[0] ?? displayName;
  const initials = initialsFromName(displayName);

  // Exclui pesquisas FAILED do histórico exibido — usuário pediu para esconder.
  const visibleSummaries = useMemo(
    () => (recentSearchesQuery.data?.content ?? []).filter((s) => s.status !== 'FAILED'),
    [recentSearchesQuery.data],
  );
  const cards = useSearchCards(visibleSummaries);

  const handleSearchPress = useCallback(
    (item: RecentSearch) => {
      navigation?.navigate('Result', { searchId: item.id });
    },
    [navigation],
  );

  const handleFABComparator = useCallback(() => {
    navigation?.navigate('Compare');
  }, [navigation]);

  const handleSelectSession = useCallback((selected: SessionResponse) => {
    setSession(selected);
    setPickerVisible(false);
  }, []);

  const handleNewSearch = useCallback(() => {
    if (!session) return;
    navigation?.navigate('Search', { sessionId: session.id, sessionName: session.name });
  }, [navigation, session]);

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

        <SelectField
          label="Sessão"
          placeholder="Selecione ou crie uma sessão"
          value={session?.name}
          subValue={session ? `Criada em ${formatDate(session.createdAt)}` : undefined}
          filled={!!session}
          onPress={() => setPickerVisible(true)}
        />

        <TouchableOpacity
          style={[styles.newSearchBtn, !session && styles.newSearchBtnDisabled]}
          onPress={handleNewSearch}
          activeOpacity={session ? 0.85 : 1}
          disabled={!session}
        >
          <Text style={[styles.newSearchPlus, !session && styles.newSearchLabelDisabled]}>+</Text>
          <Text style={[styles.newSearchLabel, !session && styles.newSearchLabelDisabled]}>
            Nova pesquisa
          </Text>
        </TouchableOpacity>

        {!session && (
          <Text style={styles.newSearchHint}>
            Escolha uma sessão acima para iniciar uma pesquisa.
          </Text>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Pesquisas recentes</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Sessions')}>
            <Text style={styles.sectionAction}>Ver sessões →</Text>
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
            Nenhuma pesquisa ainda. Selecione uma sessão e toque em "Nova pesquisa".
          </Text>
        ) : (
          cards.map((item) => (
            <SearchCard key={item.id} item={item} onPress={handleSearchPress} />
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.fabWrapper}>
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

      <BottomNav active="home" onPress={handleNavPress} />

      <SessionPickerSheet
        visible={pickerVisible}
        selectedId={session?.id ?? null}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectSession}
      />
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
