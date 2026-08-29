// src/screens/sessions/SessionsScreen.tsx
//
// ABA SESSÕES — histórico das sessões de análise do tenant.
// Lista nome + data de criação (GET /v1/sessions) e permite criar novas
// (POST /v1/sessions). Ao criar, navega direto para o detalhe, onde o
// primeiro veículo pode ser adicionado.

import React, { useCallback, useMemo, useState } from 'react';
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
import { useQueries } from '@tanstack/react-query';
import { theme } from '../../styles/theme';
import { styles } from '../../styles/sessionsScreen.styles';
import { BottomNav, useBottomNavHandler } from '../../components/BottomNav';
import { SessionCard } from '../../components/SessionCard';
import { SessionPickerSheet } from '../../components/SessionPickerSheet';
import { useSessions } from '../../hooks/useSessions';
import { listSearches } from '../../services/searches';
import { extractApiErrorMessage } from '../../services/errorHandler';
import type { SessionResponse } from '../../services/sessions';

const PAGE_SIZE = 50;

interface Props {
  navigation?: any;
}

export const SessionsScreen: React.FC<Props> = ({ navigation }) => {
  const [createVisible, setCreateVisible] = useState(false);

  const sessionsQuery = useSessions({ page: 0, size: PAGE_SIZE });
  const handleNavPress = useBottomNavHandler(navigation);

  const sessions = useMemo(() => sessionsQuery.data?.content ?? [], [sessionsQuery.data]);

  // Uma sessão sem pesquisas é indistinguível de uma cheia na listagem —
  // `size: 1` traz só o totalElements, e o cache do React Query evita repetir.
  const countQueries = useQueries({
    queries: sessions.map((session) => ({
      queryKey: ['searches', 'count', session.id] as const,
      queryFn: () => listSearches({ sessionId: session.id, page: 0, size: 1 }),
      select: (page: Awaited<ReturnType<typeof listSearches>>) => page.totalElements,
      staleTime: 1000 * 60,
    })),
  });

  const countBySessionId = useMemo(() => {
    const map: Record<string, number> = {};
    countQueries.forEach((query, index) => {
      const session = sessions[index];
      if (session && typeof query.data === 'number') {
        map[session.id] = query.data;
      }
    });
    return map;
    // countQueries é recriado a cada render — comparamos pelos dados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, countQueries.map((q) => q.data).join('|')]);

  const refetch = sessionsQuery.refetch;
  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const openSession = useCallback(
    (session: SessionResponse) => {
      navigation?.navigate('SessionDetail', {
        sessionId: session.id,
        sessionName: session.name,
      });
    },
    [navigation],
  );

  const handleCreated = useCallback(
    (session: SessionResponse) => {
      setCreateVisible(false);
      // Abre a sessão recém-criada para que o primeiro veículo possa ser
      // adicionado imediatamente.
      openSession(session);
    },
    [openSession],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Sessões</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Agrupe suas pesquisas por análise competitiva
        </Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={sessionsQuery.isRefetching && !sessionsQuery.isLoading}
            onRefresh={() => void sessionsQuery.refetch()}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => setCreateVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnPlus}>+</Text>
          <Text style={styles.primaryBtnLabel}>Nova sessão</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Histórico de sessões</Text>

        {sessionsQuery.isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : sessionsQuery.error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateError}>
              {extractApiErrorMessage(sessionsQuery.error, {
                fallback: 'Não foi possível carregar as sessões.',
              })}
            </Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateEmoji}>📁</Text>
            <Text style={styles.stateTitle}>Nenhuma sessão ainda</Text>
            <Text style={styles.stateText}>
              Crie uma sessão para organizar as pesquisas de uma mesma análise.
            </Text>
          </View>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              searchCount={countBySessionId[session.id]}
              onPress={openSession}
            />
          ))
        )}
      </ScrollView>

      <BottomNav active="sessions" onPress={handleNavPress} />

      <SessionPickerSheet
        visible={createVisible}
        startInCreateMode
        onClose={() => setCreateVisible(false)}
        onSelect={handleCreated}
      />
    </SafeAreaView>
  );
};
