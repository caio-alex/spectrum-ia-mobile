// src/screens/sessions/SessionDetailScreen.tsx
//
// DETALHE DA SESSÃO — pesquisas já realizadas (GET /v1/searches?sessionId=...),
// atalho para uma nova pesquisa já vinculada a esta sessão e exportação do
// comparativo completo (GET /v1/sessions/{id}/export).

import React, { useCallback, useMemo, useState } from 'react';
import { Linking, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../styles/theme';
import { SearchCard } from '../../components/SearchCard';
import { ExportSheet } from '../../components/ExportSheet';
import {
  BottomInset,
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  Screen,
  ScreenHeader,
  SectionHeader,
  SkeletonList,
  StatRow,
  Txt,
} from '../../components/ui';
import { useSession } from '../../hooks/useSessions';
import { useSessionSearches } from '../../hooks/useSearches';
import { useSearchCards } from '../../hooks/useSearchCards';
import { extractApiErrorMessage } from '../../services/errorHandler';
import { getSessionExportUrl } from '../../services/sessions';
import { formatDate } from '../../utils/date';
import type { RecentSearch } from '../../mocks/homeData';
import type { ExportFormat } from '../../types/api';

const PAGE_SIZE = 50;

// Mesmas opções da exportação de uma pesquisa, com o texto ajustado para o
// escopo da sessão — hoje só o CSV é gerado pelo backend; o PDF responde 501.
const EXPORT_OPTIONS = [
  {
    format: 'pdf' as ExportFormat,
    icon: 'pdf' as const,
    title: 'Baixar PDF',
    subtitle: 'Relatório formatado, pronto para leitura',
  },
  {
    format: 'csv' as ExportFormat,
    icon: 'csv' as const,
    title: 'Baixar CSV',
    subtitle: 'Todos os veículos da sessão em uma única planilha',
  },
];

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

  // ── Exportação da sessão inteira ────────────────────────────────────────
  const [exportVisible, setExportVisible] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const openExportSheet = useCallback(() => {
    setExportError(null);
    setExportVisible(true);
  }, []);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!sessionId || isExporting) return;
      setIsExporting(format);
      setExportError(null);
      try {
        const { downloadUrl } = await getSessionExportUrl(sessionId, format);
        await Linking.openURL(downloadUrl);
        setExportVisible(false);
      } catch (err) {
        setExportError(
          extractApiErrorMessage(err, {
            fallback: 'Não foi possível gerar o arquivo da sessão. Tente novamente.',
            byStatus: {
              403: 'Seu perfil não permite exportar sessões.',
              501: 'Exportação em PDF ainda não está disponível.',
            },
          }),
        );
      } finally {
        setIsExporting(null);
      }
    },
    [sessionId, isExporting],
  );

  if (!sessionId) {
    navigation?.goBack?.();
    return null;
  }

  const total = searchesQuery.data?.totalElements ?? 0;
  const totalFields = cards.reduce((sum, c) => sum + c.totalFields, 0);

  return (
    <Screen>
      <ScreenHeader
        onBack={() => navigation?.goBack()}
        actions={
          <IconButton icon="download" onPress={openExportSheet} accessibilityLabel="Exportar sessão" />
        }
        eyebrow="Sessão"
        title={sessionName}
        subtitle={session ? `Criada em ${formatDate(session.createdAt)}` : 'Carregando…'}
      >
        <StatRow
          onDark
          style={{ marginTop: theme.space[5] }}
          items={[
            { icon: 'vehicle', value: total, label: total === 1 ? 'Veículo' : 'Veículos' },
            { icon: 'fields', value: totalFields, label: 'Campos' },
          ]}
        />
      </ScreenHeader>

      <ScrollView
        contentContainerStyle={styles.body}
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
        {session?.description ? (
          <Card variant="muted" style={{ marginBottom: theme.space[4] }}>
            <Txt variant="caption" tone="muted">
              {session.description}
            </Txt>
          </Card>
        ) : null}

        <Button
          label="Nova pesquisa nesta sessão"
          icon="add"
          size="lg"
          onPress={handleNewSearch}
          style={{ marginBottom: theme.space[6] }}
        />

        <SectionHeader
          title="Veículos analisados"
          actionLabel={cards.length > 1 ? 'Comparar' : undefined}
          onAction={cards.length > 1 ? () => navigation?.navigate('Compare') : undefined}
        />

        {searchesQuery.isLoading ? (
          <SkeletonList count={3} />
        ) : searchesQuery.error ? (
          <ErrorState
            description={extractApiErrorMessage(searchesQuery.error, {
              fallback: 'Não foi possível carregar as pesquisas desta sessão.',
            })}
            onRetry={() => void searchesQuery.refetch()}
          />
        ) : cards.length === 0 ? (
          <EmptyState
            icon="vehicle"
            title="Nenhum veículo nesta sessão"
            description="Adicione o primeiro veículo para começar a montar o comparativo."
            actionLabel="Nova pesquisa"
            onAction={handleNewSearch}
          />
        ) : (
          <View>
            {cards.map((item) => (
              <SearchCard key={item.id} item={item} onPress={handleSearchPress} />
            ))}
          </View>
        )}

        <BottomInset extra={theme.space[6]} />
      </ScrollView>

      <ExportSheet
        visible={exportVisible}
        isExporting={isExporting}
        errorMessage={exportError}
        title="Exportar sessão"
        subtitle="Um único arquivo com a ficha técnica de todos os veículos desta sessão"
        options={EXPORT_OPTIONS}
        onClose={() => setExportVisible(false)}
        onSelect={handleExport}
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
