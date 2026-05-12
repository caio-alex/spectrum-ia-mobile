// src/components/SearchCard.tsx
// Card de pesquisa recente — usado na HomeScreen
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../styles/theme';
import { SourceBadge } from './SourceBadge';
import type { RecentSearch } from '../mocks/homeData';
import { styles } from '../styles/searchCard.styles';
interface Props {
  item: RecentSearch;
  onPress?: (item: RecentSearch) => void;
}

const CAR_ICON = (
  // Inline SVG-like car shape via View
  // (React Native não renderiza SVG diretamente sem lib — usamos emoji/unicode)
  '🚗'
);

export const SearchCard: React.FC<Props> = ({ item, onPress }) => {
  const categoryLabel = item.categories.join(' · ');
  const isInProgress = item.status === 'in_progress';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={() => onPress?.(item)}
    >
      {/* Ícone lateral */}
      <View style={styles.iconBox}>
        <Text style={styles.iconEmoji}>{CAR_ICON}</Text>
      </View>

      {/* Conteúdo central */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.modelName} numberOfLines={1}>
            {item.brand} {item.model} {item.version}
          </Text>
          <SourceBadge tag={item.sourceTag} small />
        </View>

        <Text style={styles.categories} numberOfLines={1}>
          {categoryLabel}
        </Text>

        <View style={[styles.row, { marginTop: 6 }]}>
          <Text style={styles.time}>{item.relativeTime}</Text>

          {isInProgress ? (
            <View style={styles.progressBadge}>
              <ActivityIndicator size={8} color={theme.colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.progressText}>Em andamento</Text>
            </View>
          ) : (
            <View style={styles.fieldsBadge}>
              <Text style={styles.fieldsText}>{item.totalFields} campos</Text>
            </View>
          )}
        </View>
      </View>

      {/* Chevron */}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

