// src/components/SearchCard.tsx
//
// Card de pesquisa — usado na Home e no detalhe da sessão.
//
// O selo de fonte ("Oficial") saiu daqui de propósito: o adapter o preenchia
// fixo para todos os itens, então ele passava uma garantia de procedência que o
// dado não tinha. Procedência agora só aparece na tela de resultado, campo a
// campo, onde ela é real.

import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';
import { Badge, Card, Icon, Txt } from './ui';
import type { RecentSearch } from '../mocks/homeData';

interface Props {
  item: RecentSearch;
  onPress?: (item: RecentSearch) => void;
}

export const SearchCard: React.FC<Props> = ({ item, onPress }) => {
  const isInProgress = item.status === 'in_progress';
  const title = [item.brand, item.model].filter(Boolean).join(' ') || 'Veículo';

  return (
    <Card
      onPress={onPress ? () => onPress(item) : undefined}
      accessibilityLabel={`Pesquisa ${title}`}
      padding={theme.space[3]}
      style={styles.card}
    >
      <View style={[styles.iconBox, isInProgress && styles.iconBoxLive]}>
        <Icon
          name="vehicle"
          size={17}
          color={isInProgress ? theme.brand[500] : theme.brand[700]}
        />
      </View>

      <View style={styles.content}>
        <Txt variant="bodyStrong" numberOfLines={1}>
          {title}
        </Txt>
        {item.version ? (
          <Txt variant="micro" tone="muted" numberOfLines={1}>
            {item.version}
          </Txt>
        ) : null}

        <View style={styles.metaRow}>
          <Txt variant="micro" tone="faint">
            {item.relativeTime}
          </Txt>
          <View style={styles.dotSeparator} />
          {isInProgress ? (
            <View style={styles.liveRow}>
              <LivePulse />
              <Txt variant="micro" tone="accent" style={{ fontFamily: theme.fonts.semibold }}>
                Em andamento
              </Txt>
            </View>
          ) : (
            <Txt variant="micro" tone="muted">
              {item.totalFields > 0 ? `${item.totalFields} campos` : 'Sem campos'}
            </Txt>
          )}
        </View>
      </View>

      {item.status === 'error' ? (
        <Badge label="Falhou" tone="danger" size="sm" />
      ) : (
        <Icon name="chevronRight" size={11} color={theme.ink[300]} />
      )}
    </Card>
  );
};

/** Ponto pulsante — sinaliza processamento sem ocupar o espaço de um spinner. */
const LivePulse: React.FC = () => {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.pulse,
        {
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
          transform: [
            { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.15] }) },
          ],
        },
      ]}
    />
  );
};

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
  iconBoxLive: {
    backgroundColor: theme.brand[100],
  },
  content: {
    flex: 1,
    gap: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    marginTop: 3,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.ink[200],
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.brand[500],
  },
});
