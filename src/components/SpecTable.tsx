// src/components/SpecTable.tsx
//
// A tabela de especificações — o miolo do resultado.
//
// Cada linha traz o dado E a sua procedência. A leitura da procedência é feita
// por três barrinhas (cheias = Oficial, duas = Review, uma = Estimado) em vez do
// ponto vermelho/laranja/verde anterior: vermelho para "Estimado" fazia um dado
// inferido parecer um erro, e treinava o usuário a ignorar alertas de verdade.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, type ConfidenceKey } from '../styles/theme';
import { ConfidenceBars, Icon, PressableScale, Txt } from './ui';

export interface SpecItem {
  label: string;
  value: string;
  /** Chave de procedência já normalizada (official | review | estimated). */
  level: ConfidenceKey;
}

interface Props {
  data: SpecItem[];
  onPressItem?: (item: SpecItem) => void;
}

export const SpecTable: React.FC<Props> = ({ data, onPressItem }) => (
  <View>
    {data.map((item, index) => {
      const isLast = index === data.length - 1;
      const row = (
        <>
          <View style={styles.labelCol}>
            <Txt variant="caption" tone="muted" numberOfLines={3}>
              {item.label}
            </Txt>
          </View>
          <View style={styles.valueCol}>
            <Txt variant="captionStrong" numberOfLines={4} style={{ textAlign: 'right' }}>
              {item.value}
            </Txt>
            <View style={styles.confidenceRow}>
              <ConfidenceBars level={item.level} />
              <Txt variant="micro" tone="faint" style={{ fontSize: 10 }}>
                {theme.confidence[item.level].label}
              </Txt>
              {onPressItem ? (
                <Icon name="chevronRight" size={9} color={theme.ink[300]} />
              ) : null}
            </View>
          </View>
        </>
      );

      if (!onPressItem) {
        return (
          <View key={`${item.label}-${index}`} style={[styles.row, isLast && styles.rowLast]}>
            {row}
          </View>
        );
      }

      return (
        <PressableScale
          key={`${item.label}-${index}`}
          onPress={() => onPressItem(item)}
          scaleTo={0.99}
          accessibilityRole="button"
          accessibilityLabel={`${item.label}: ${item.value}`}
          style={[styles.row, isLast && styles.rowLast]}
        >
          {row}
        </PressableScale>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[4],
    paddingVertical: theme.space[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  labelCol: {
    flex: 1,
    paddingTop: 1,
  },
  valueCol: {
    flex: 1.15,
    alignItems: 'flex-end',
    gap: 5,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
