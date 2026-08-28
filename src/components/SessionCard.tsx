// src/components/SessionCard.tsx
// Item do histórico de sessões — nome, descrição, data de criação e nº de pesquisas.
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/sessionCard.styles';
import { formatDate } from '../utils/date';
import type { SessionResponse } from '../services/sessions';

interface Props {
  session: SessionResponse;
  /** Total de pesquisas da sessão; `undefined` enquanto carrega. */
  searchCount?: number;
  onPress: (session: SessionResponse) => void;
}

export const SessionCard: React.FC<Props> = ({ session, searchCount, onPress }) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.75}
    onPress={() => onPress(session)}
  >
    <View style={styles.iconBox}>
      <Text style={styles.iconEmoji}>📁</Text>
    </View>

    <View style={styles.content}>
      <Text style={styles.name} numberOfLines={1}>
        {session.name}
      </Text>
      {session.description ? (
        <Text style={styles.description} numberOfLines={1}>
          {session.description}
        </Text>
      ) : null}

      <View style={styles.metaRow}>
        <Text style={styles.date}>Criada em {formatDate(session.createdAt)}</Text>
        {searchCount != null && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {searchCount} {searchCount === 1 ? 'pesquisa' : 'pesquisas'}
            </Text>
          </View>
        )}
      </View>
    </View>

    <Text style={styles.chevron}>›</Text>
  </TouchableOpacity>
);
