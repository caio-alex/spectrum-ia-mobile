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

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryAlpha08,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  modelName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.2,
    flex: 1,
  },
  categories: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  time: {
    fontSize: 10.5,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  fieldsBadge: {
    backgroundColor: theme.colors.primaryAlpha08,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  fieldsText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondaryAlpha15,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  progressText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.textMuted,
    marginLeft: 4,
    lineHeight: 24,
  },
});