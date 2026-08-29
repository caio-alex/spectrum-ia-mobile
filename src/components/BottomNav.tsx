// src/components/BottomNav.tsx
//
// Barra de navegação inferior compartilhada entre Home, Sessões e Perfil.
//
// Mudanças de comportamento em relação à versão anterior:
//   - "Perfil" abre uma tela de perfil de verdade. Antes disparava um Alert de
//     logout — um item de navegação que executa uma ação destrutiva é uma
//     armadilha, ainda mais sendo vizinho do item mais usado.
//   - Ícones vetoriais no lugar de emoji, que mudavam de desenho a cada SO.
//   - A aba ativa é marcada pela faixa da marca, e não só por cor de texto.
//
// Sobre o espaçamento: cada item é um alvo de toque de 52px de altura mínima
// (acima dos 44px recomendados) e o rótulo nunca quebra em duas linhas. A
// primeira versão empilhava indicador, ícone e texto com folga de 3px, o que
// deixava tudo grudado e derrubava a área de toque em telas menores.

import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { Icon, type IconName } from './ui/Icon';
import { PressableScale } from './ui/Pressable';
import { SpectrumRay } from './ui/Spectrum';
import { Txt } from './ui/Txt';

export const NAV_ITEMS: Array<{ icon: IconName; label: string; key: NavKey }> = [
  { icon: 'home', label: 'Início', key: 'home' },
  { icon: 'search', label: 'Pesquisar', key: 'search' },
  { icon: 'sessions', label: 'Sessões', key: 'sessions' },
  { icon: 'profile', label: 'Perfil', key: 'profile' },
];

export type NavKey = 'home' | 'search' | 'sessions' | 'profile';

interface Props {
  active: NavKey;
  onPress: (key: NavKey) => void;
}

export const BottomNav: React.FC<Props> = ({ active, onPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, theme.space[2]) }]}>
      {NAV_ITEMS.map(({ icon, label, key }) => {
        const isActive = active === key;
        return (
          <PressableScale
            key={key}
            onPress={() => onPress(key)}
            scaleTo={0.92}
            dimTo={0.75}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <View style={styles.indicatorSlot}>
              {isActive ? <SpectrumRay height={3} rounded style={styles.indicator} /> : null}
            </View>
            <Icon name={icon} size={19} color={isActive ? theme.brand[800] : theme.ink[400]} />
            <Txt
              variant="micro"
              numberOfLines={1}
              color={isActive ? theme.brand[800] : theme.ink[400]}
              style={{
                fontFamily: isActive ? theme.fonts.bold : theme.fonts.medium,
                fontSize: 11,
                marginTop: 5,
              }}
            >
              {label}
            </Txt>
          </PressableScale>
        );
      })}
    </View>
  );
};

/**
 * Roteamento padrão da bottom nav. `home` usa popToTop para não empilhar uma
 * segunda Home quando o usuário volta de outra aba.
 */
export function useBottomNavHandler(navigation: any) {
  return useCallback(
    (key: NavKey) => {
      if (key === 'home') {
        if (typeof navigation?.popToTop === 'function') navigation.popToTop();
        else navigation?.navigate?.('Home');
        return;
      }
      if (key === 'search') {
        navigation?.navigate?.('Search');
        return;
      }
      if (key === 'sessions') {
        navigation?.navigate?.('Sessions');
        return;
      }
      if (key === 'profile') {
        navigation?.navigate?.('Profile');
      }
    },
    [navigation],
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    paddingTop: theme.space[2],
    paddingHorizontal: theme.space[2],
  },
  item: {
    flex: 1,
    // minWidth: 0 impede que o rótulo mais longo ("Pesquisar") empurre os
    // vizinhos: cada aba fica com exatamente 1/4 da largura em qualquer tela.
    minWidth: 0,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: theme.space[1],
    paddingBottom: theme.space[2],
  },
  indicatorSlot: {
    height: 3,
    width: 26,
    marginBottom: theme.space[2],
    justifyContent: 'center',
  },
  indicator: {
    width: 26,
  },
});
