// src/screens/home/HomeScreen.tsx
//
// TELA 02 — HOME
//
// Estrutura: header escuro da marca (saudação, logo, avatar e métricas) →
// costura em degradê → corpo claro com a sessão ativa, o botão de nova pesquisa
// e o histórico recente.
//
// Duas decisões de produto que mudaram em relação à versão anterior:
//
//   • As métricas eram fixas no código (12 / 247 / 3). Números inventados na
//     primeira tela do app corroem a confiança em tudo que vem depois — agora
//     saem dos totais que a própria API já devolve.
//   • O FAB de comparação vivia com um balão de dica permanente ao lado. Virou
//     uma ação explícita na linha de atalhos, junto de "ver sessões".
//
// Dados: perfil no AuthContext, pesquisas em GET /v1/searches, sessões em
// GET /v1/sessions (via SessionPickerSheet).

import React, { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { theme } from '../../styles/theme';
import { SearchCard } from '../../components/SearchCard';
import { SessionPickerSheet } from '../../components/SessionPickerSheet';
import { BottomNav, useBottomNavHandler } from '../../components/BottomNav';
import {
  BottomInset,
  Button,
  Callout,
  EmptyState,
  ErrorState,
  Icon,
  PressableScale,
  Screen,
  ScreenHeader,
  SectionHeader,
  SelectRow,
  SkeletonList,
  SpectrumFlow,
  StatRow,
  Txt,
  type IconName,
} from '../../components/ui';
import { useAuth } from '../../contexts';
import { useRecentSearches } from '../../hooks/useSearches';
import { useSessions } from '../../hooks/useSessions';
import { useSearchCards } from '../../hooks/useSearchCards';
import { formatDate } from '../../utils/date';
import type { RecentSearch } from '../../mocks/homeData';
import type { SessionResponse } from '../../services/sessions';

const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0][0] ?? '?').toUpperCase();
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
};

/** Saudação pela hora local — custa nada e faz o app parecer presente. */
const greetingFor = (date: Date): string => {
  const h = date.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

export const HomeScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const recentSearchesQuery = useRecentSearches({ page: 0, size: 10 });
  const sessionsQuery = useSessions({ page: 0, size: 1 });
  const handleNavPress = useBottomNavHandler(navigation);

  const displayName = user?.name ?? 'usuário';
  const firstName = displayName.split(' ')[0] ?? displayName;

  // Pesquisas FAILED ficam fora do histórico exibido — não há nada a abrir.
  const visibleSummaries = useMemo(
    () => (recentSearchesQuery.data?.content ?? []).filter((s) => s.status !== 'FAILED'),
    [recentSearchesQuery.data],
  );
  const cards = useSearchCards(visibleSummaries);

  // "Campos" saiu daqui. Na abertura do app ele não responde a nenhuma pergunta
  // que o usuário esteja se fazendo — e ainda somava só as pesquisas da primeira
  // página carregada, então o número nem era o total de verdade. A contagem de
  // campos continua onde ela significa alguma coisa: no resultado da pesquisa e
  // no detalhe da sessão.
  const stats = useMemo(
    () => [
      {
        icon: 'search' as IconName,
        value: recentSearchesQuery.data?.totalElements ?? 0,
        label: 'Pesquisas',
      },
      {
        icon: 'sessions' as IconName,
        value: sessionsQuery.data?.totalElements ?? 0,
        label: 'Sessões',
      },
    ],
    [recentSearchesQuery.data, sessionsQuery.data],
  );

  const handleSearchPress = useCallback(
    (item: RecentSearch) => {
      navigation?.navigate('Result', { searchId: item.id });
    },
    [navigation],
  );

  const handleSelectSession = useCallback((selected: SessionResponse) => {
    setSession(selected);
    setPickerVisible(false);
  }, []);

  const handleNewSearch = useCallback(() => {
    if (!session) return;
    navigation?.navigate('Search', { sessionId: session.id, sessionName: session.name });
  }, [navigation, session]);

  return (
    <Screen>
      <ScreenHeader
        // barGap 0: a logo começa exatamente na linha em que o nome termina,
        // em vez de flutuar num vão no meio do header.
        barGap={0}
        leading={
          <View style={{ flex: 1 }}>
            <Txt variant="caption" tone="inverseMuted">
              {greetingFor(new Date())},
            </Txt>
            <Txt variant="title2" tone="inverse" numberOfLines={1}>
              {firstName}
            </Txt>
          </View>
        }
        actions={
          <PressableScale
            onPress={() => navigation?.navigate('Profile')}
            scaleTo={0.9}
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            style={styles.avatar}
          >
            <Txt variant="captionStrong" tone="inverse">
              {initialsFromName(displayName)}
            </Txt>
          </PressableScale>
        }
      >
        {/* A logo fica centralizada e sozinha na sua linha: é o único elemento
            de marca do header, e disputá-la com a saudação e o avatar tirava
            dela justamente o lugar de destaque. */}
        <View style={styles.logoRow}>
          <Image
            source={require('../../../assets/spectrum-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <StatRow items={stats} onDark style={{ marginTop: theme.space[4] }} />
      </ScreenHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Toda pesquisa pertence a uma sessão — por isso ela abre a tela. */}
        <SelectRow
          label="Sessão ativa"
          icon="sessions"
          placeholder="Selecione ou crie uma sessão"
          value={session?.name}
          subValue={session ? `Criada em ${formatDate(session.createdAt)}` : undefined}
          onPress={() => setPickerVisible(true)}
        />

        <Button
          label="Nova pesquisa"
          icon="add"
          size="lg"
          onPress={handleNewSearch}
          disabled={!session}
          style={{ marginTop: theme.space[1] }}
        />
        {!session ? (
          <Callout tone="info" compact style={{ marginTop: theme.space[3] }}>
            Escolha uma sessão acima para liberar a pesquisa.
          </Callout>
        ) : null}

        <View style={styles.quickRow}>
          {/* Durações diferentes de propósito: com o mesmo tempo os dois
              degradês andariam em bloco, o que denuncia a animação e vira
              ruído. Desencontrados, eles entram e saem de fase sozinhos. */}
          <QuickAction
            icon="compare"
            label="Comparar"
            hint="Ficha lado a lado"
            flowDuration={7000}
            onPress={() => navigation?.navigate('Compare')}
          />
          <QuickAction
            icon="sessions"
            label="Sessões"
            hint="Todas as análises"
            flowDuration={8600}
            onPress={() => navigation?.navigate('Sessions')}
          />
        </View>

        <SectionHeader
          title="Pesquisas recentes"
          actionLabel="Ver sessões"
          onAction={() => navigation?.navigate('Sessions')}
          style={{ marginTop: theme.space[7] }}
        />

        {recentSearchesQuery.isLoading ? (
          <SkeletonList count={3} />
        ) : recentSearchesQuery.error ? (
          <ErrorState
            description="Não foi possível carregar as pesquisas recentes."
            onRetry={() => void recentSearchesQuery.refetch()}
          />
        ) : cards.length === 0 ? (
          <EmptyState
            brandMark
            title="Nada pesquisado ainda"
            description="Escolha uma sessão e faça a primeira busca — os resultados aparecem aqui."
            actionLabel={session ? 'Nova pesquisa' : 'Escolher sessão'}
            onAction={session ? handleNewSearch : () => setPickerVisible(true)}
          />
        ) : (
          cards.map((item) => (
            <SearchCard key={item.id} item={item} onPress={handleSearchPress} />
          ))
        )}

        <BottomInset extra={theme.space[4]} />
      </ScrollView>

      <BottomNav active="home" onPress={handleNavPress} />

      <SessionPickerSheet
        visible={pickerVisible}
        selectedId={session?.id ?? null}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelectSession}
      />
    </Screen>
  );
};

/* ── Atalho ──────────────────────────────────────────────────────────────── */

/**
 * Atalho da Home, sobre degradê azul em movimento.
 *
 * Estes dois cards são as únicas superfícies do corpo claro que se mexem — é o
 * que os separa da lista de pesquisas logo abaixo sem precisar de mais uma
 * borda ou mais um título.
 *
 * O texto é branco, então o degradê fica na metade escura da rampa
 * (marinho → azure → marinho). O aqua da ponta do espectro ficaria bonito aqui
 * e ilegível: branco sobre aqua dá 1,7:1 de contraste.
 */
const QuickAction: React.FC<{
  icon: IconName;
  label: string;
  hint: string;
  onPress: () => void;
  /** Tempo de meia volta do degradê. Ver a nota no ponto de uso. */
  flowDuration?: number;
}> = ({ icon, label, hint, onPress, flowDuration }) => (
  <PressableScale
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={label}
    scaleTo={0.97}
    style={styles.quickCard}
  >
    <SpectrumFlow duration={flowDuration} />
    <View style={styles.quickIcon}>
      <Icon name={icon} size={14} color="#FFFFFF" />
    </View>
    <Txt variant="captionStrong" tone="inverse" style={{ marginTop: theme.space[2] }}>
      {label}
    </Txt>
    <Txt variant="micro" tone="inverseMuted" numberOfLines={1}>
      {hint}
    </Txt>
  </PressableScale>
);

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    alignItems: 'center',
  },
  logo: {
    width: 186,
    height: 38,
  },
  body: {
    padding: theme.space[4],
    paddingTop: theme.space[5],
  },
  quickRow: {
    flexDirection: 'row',
    gap: theme.space[2],
    marginTop: theme.space[4],
  },
  quickCard: {
    flex: 1,
    padding: theme.space[3],
    borderRadius: theme.radii.lg,
    // O degradê é um filho absoluto: sem isto ele vazaria pelos cantos.
    overflow: 'hidden',
    ...theme.shadow.brand,
  },
  quickIcon: {
    width: 30,
    height: 30,
    borderRadius: theme.radii.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
