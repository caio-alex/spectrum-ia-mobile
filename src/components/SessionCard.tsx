// src/components/SessionCard.tsx
// Item do histórico de sessões — nome, descrição, data de criação e nº de pesquisas.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';
import { formatDate } from '../utils/date';
import type { SessionResponse } from '../services/sessions';
import { Badge, Card, Icon, Skeleton, Txt } from './ui';

interface Props {
  session: SessionResponse;
  /** Total de pesquisas da sessão; `undefined` enquanto carrega. */
  searchCount?: number;
  onPress: (session: SessionResponse) => void;
}

export const SessionCard: React.FC<Props> = ({ session, searchCount, onPress }) => (
  <Card
    onPress={() => onPress(session)}
    accessibilityLabel={`Sessão ${session.name}`}
    padding={theme.space[3]}
    style={styles.card}
  >
    <View style={styles.iconBox}>
      <Icon name="sessionOpen" size={17} color={theme.brand[700]} />
    </View>

    <View style={styles.content}>
      <Txt variant="bodyStrong" numberOfLines={1}>
        {session.name}
      </Txt>
      {session.description ? (
        <Txt variant="micro" tone="muted" numberOfLines={1}>
          {session.description}
        </Txt>
      ) : null}

      <View style={styles.metaRow}>
        <Txt variant="micro" tone="faint">
          {formatDate(session.createdAt)}
        </Txt>
        {searchCount == null ? (
          <Skeleton width={58} height={16} radius={theme.radii.full} />
        ) : (
          <Badge
            label={`${searchCount} ${searchCount === 1 ? 'pesquisa' : 'pesquisas'}`}
            tone={searchCount > 0 ? 'brand' : 'neutral'}
            size="sm"
          />
        )}
      </View>
    </View>

    <Icon name="chevronRight" size={11} color={theme.ink[300]} />
  </Card>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    marginBottom: theme.space[2],
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: theme.radii.md,
    backgroundColor: theme.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    marginTop: 5,
  },
});
