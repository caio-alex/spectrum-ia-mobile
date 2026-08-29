// src/screens/sessions/SessionsScreen.tsx
//
// ABA SESSÕES — histórico das sessões de análise do tenant.
// Lista nome + data de criação (GET /v1/sessions) e permite criar novas
// (POST /v1/sessions). Ao criar, navega direto para o detalhe, onde o primeiro
// veículo pode ser adicionado.

import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useQueries } from '@tanstack/react-query';
import { theme } from '../../styles/theme';
import { BottomNav, useBottomNavHandler } from '../../components/BottomNav';
import { SessionCard } from '../../components/SessionCard';
import { SessionPickerSheet } from '../../components/SessionPickerSheet';
import {
  BottomInset,
  Button,
  EmptyState,
  ErrorState,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
} from '../../components/ui';
import { useSessions } from '../../hooks/useSessions';
import { listSearches } from '../../services/searches';
import { extractApiErrorMessage } from '../../services/errorHandler';
import type { SessionResponse } from '../../services/sessions';

const PAGE_SIZE = 50;

export const SessionsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
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

  const total = sessionsQuery.data?.totalElements ?? 0;

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Organize suas análises"
        title="Sessões"
        subtitle={
          total > 0
            ? `${total} ${total === 1 ? 'sessão registrada' : 'sessões registradas'}`
            : 'Agrupe as pesquisas de uma mesma análise competitiva'
        }
      />

      <ScrollView
        contentContainerStyle={styles.body}
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
        <Button
          label="Nova sessão"
          icon="add"
          size="lg"
          onPress={() => setCreateVisible(true)}
          style={{ marginBottom: theme.space[6] }}
        />

        <SectionHeader title="Histórico" />

        {sessionsQuery.isLoading ? (
          <SkeletonList count={4} />
        ) : sessionsQuery.error ? (
          <ErrorState
            description={extractApiErrorMessage(sessionsQuery.error, {
              fallback: 'Não foi possível carregar as sessões.',
            })}
            onRetry={() => void sessionsQuery.refetch()}
          />
        ) : sessions.length === 0 ? (
          <EmptyState
            brandMark
            title="Nenhuma sessão ainda"
            description="Uma sessão agrupa as pesquisas de uma mesma análise — por exemplo, todos os concorrentes de um lançamento."
            actionLabel="Criar primeira sessão"
            onAction={() => setCreateVisible(true)}
          />
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

        <BottomInset extra={theme.space[4]} />
      </ScrollView>

      <BottomNav active="sessions" onPress={handleNavPress} />

      <SessionPickerSheet
        visible={createVisible}
        startInCreateMode
        onClose={() => setCreateVisible(false)}
        onSelect={handleCreated}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: {
    padding: theme.space[4],
    paddingTop: theme.space[5],
  },
});
