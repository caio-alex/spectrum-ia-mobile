// src/screens/sessions/SessionDetailScreen.tsx
//
// DETALHE DA SESSÃO — pesquisas já realizadas (GET /v1/searches?sessionId=...)
// e atalho para uma nova pesquisa já vinculada a esta sessão.

import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { styles } from '../../styles/sessionsScreen.styles';
import { SearchCard } from '../../components/SearchCard';
import { useSession } from '../../hooks/useSessions';
import { useSessionSearches } from '../../hooks/useSearches';
import { useSearchCards } from '../../hooks/useSearchCards';
import { extractApiErrorMessage } from '../../services/errorHandler';
import { formatDate } from '../../utils/date';
import type { RecentSearch } from '../../mocks/homeData';

const PAGE_SIZE = 50;

interface RouteParams {
  sessionId: string;
  /** Nome vindo da navegação — evita header vazio enquanto o detalhe carrega. */
  sessionName?: string;
}

interface Props {
  navigation?: any;
  route?: { params?: RouteParams };
}

export const SessionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const sessionId = route?.params?.sessionId;

  const sessionQuery = useSession(sessionId);
  const searchesQuery = useSessionSearches(sessionId, { page: 0, size: PAGE_SIZE });

  // Exclui FAILED do histórico exibido — mesma regra da Home.
  const summaries = useMemo(
    () => (searchesQuery.data?.content ?? []).filter((s) => s.status !== 'FAILED'),
    [searchesQuery.data],
  );
  const cards = useSearchCards(summaries);

  const refetchSearches = searchesQuery.refetch;
  useFocusEffect(
    useCallback(() => {
      if (sessionId) void refetchSearches();
    }, [sessionId, refetchSearches]),
  );

  const session = sessionQuery.data;
  const sessionName = session?.name ?? route?.params?.sessionName ?? 'Sessão';

  const handleNewSearch = useCallback(() => {
    if (!sessionId) return;
    navigation?.navigate('Search', { sessionId, sessionName });
  }, [navigation, sessionId, sessionName]);

  const handleSearchPress = useCallback(
    (item: RecentSearch) => {
      navigation?.navigate('Result', { searchId: item.id });
    },
    [navigation],
  );

  if (!sessionId) {
    navigation?.goBack?.();
    return null;
  }

  const total = searchesQuery.data?.totalElements ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerSessionName} numberOfLines={2}>
            {sessionName}
          </Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {session ? `Criada em ${formatDate(session.createdAt)}` : 'Carregando sessão...'}
        </Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={searchesQuery.isRefetching && !searchesQuery.isLoading}
            onRefresh={() => void searchesQuery.refetch()}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {session ? (
          <View style={styles.sessionMetaCard}>
            {session.description ? (
              <Text style={styles.sessionMetaDescription}>{session.description}</Text>
            ) : null}
            <View style={styles.sessionMetaRow}>
              <Text style={styles.sessionMetaLabel}>
                Criada em {formatDate(session.createdAt)}
              </Text>
              <View style={styles.sessionMetaBadge}>
                <Text style={styles.sessionMetaBadgeText}>
                  {total} {total === 1 ? 'pesquisa' : 'pesquisas'}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleNewSearch}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnPlus}>+</Text>
          <Text style={styles.primaryBtnLabel}>Nova pesquisa nesta sessão</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Pesquisas da sessão</Text>

        {searchesQuery.isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : searchesQuery.error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateError}>
              {extractApiErrorMessage(searchesQuery.error, {
                fallback: 'Não foi possível carregar as pesquisas desta sessão.',
              })}
            </Text>
          </View>
        ) : cards.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateEmoji}>🚗</Text>
            <Text style={styles.stateTitle}>Nenhum veículo nesta sessão</Text>
            <Text style={styles.stateText}>
              Toque em "Nova pesquisa nesta sessão" para adicionar o primeiro veículo.
            </Text>
          </View>
        ) : (
          cards.map((item) => (
            <SearchCard key={item.id} item={item} onPress={handleSearchPress} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
