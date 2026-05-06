// src/components/StatsBar.tsx
// Barra de estatísticas rápidas do usuário — HomeScreen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

interface StatItem {
  label: string;
  value: number | string;
  emoji: string;
}

interface Props {
  stats: StatItem[];
}

export const StatsBar: React.FC<Props> = ({ stats }) => (
  <View style={styles.container}>
    {stats.map((stat, i) => (
      <React.Fragment key={stat.label}>
        <View style={styles.item}>
          <Text style={styles.emoji}>{stat.emoji}</Text>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
        {i < stats.length - 1 && <View style={styles.divider} />}
      </React.Fragment>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  emoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 9,
    color: theme.colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
});