// src/components/ConfidenceSummary.tsx
//
// A distribuição de procedência de um resultado inteiro, numa barra só.
//
// É a resposta à pergunta que o usuário faz antes de usar qualquer número numa
// apresentação: "dá para confiar nisso?". Em vez de um percentual solto de
// acurácia, ela mostra quanto do resultado veio de fonte oficial, quanto de
// review e quanto foi inferido pela IA — e vira o resumo executivo da tela.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, type ConfidenceKey } from '../styles/theme';
import { Card, Icon, Txt } from './ui';

export interface ConfidenceCounts {
  official: number;
  review: number;
  estimated: number;
  total: number;
}

const ORDER: ConfidenceKey[] = ['official', 'review', 'estimated'];

export const ConfidenceSummary: React.FC<{ counts: ConfidenceCounts }> = ({ counts }) => {
  if (counts.total === 0) return null;

  const officialPct = Math.round((counts.official / counts.total) * 100);

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Icon name="confidence" size={14} color={theme.brand[700]} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="captionStrong">Procedência dos dados</Txt>
          <Txt variant="micro" tone="faint">
            {officialPct}% vem direto de fonte oficial
          </Txt>
        </View>
      </View>

      {/* Barra empilhada: cada faixa é uma procedência, na proporção real. */}
      <View style={styles.bar}>
        {ORDER.map((key) => {
          const value = counts[key];
          if (value === 0) return null;
          return (
            <View
              key={key}
              style={{
                flex: value,
                backgroundColor: theme.confidence[key].dot,
              }}
            />
          );
        })}
      </View>

      <View style={styles.legend}>
        {ORDER.map((key) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.confidence[key].dot }]} />
            <Txt variant="micro" tone="muted" style={{ fontSize: 10 }}>
              {theme.confidence[key].label}
            </Txt>
            <Txt variant="micro" style={{ fontFamily: theme.fonts.semibold, fontSize: 10 }}>
              {counts[key]}
            </Txt>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: theme.space[3],
    marginBottom: theme.space[5],
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
  },
  headIcon: {
    width: 34,
    height: 34,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: theme.ink[100],
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.space[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
