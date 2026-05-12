// src/components/StatsBar.tsx
// Barra de estatísticas rápidas do usuário — HomeScreen
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import { styles } from '../styles/statsBar.styles';
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

