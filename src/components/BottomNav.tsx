// src/components/BottomNav.tsx
// Barra de navegação inferior compartilhada entre Home e Sessões.
import React, { useCallback } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts';
import { styles } from '../styles/bottomNav.styles';

export const NAV_ITEMS = [
  { icon: '🏠', label: 'Home',     key: 'home'     },
  { icon: '🔍', label: 'Pesquisa', key: 'search'   },
  { icon: '📁', label: 'Sessões',  key: 'sessions' },
  { icon: '👤', label: 'Perfil',   key: 'profile'  },
] as const;

export type NavKey = typeof NAV_ITEMS[number]['key'];

interface Props {
  active: NavKey;
  onPress: (key: NavKey) => void;
}

export const BottomNav: React.FC<Props> = ({ active, onPress }) => (
  <View style={styles.bottomNav}>
    {NAV_ITEMS.map(({ icon, label, key }) => {
      const isActive = active === key;
      return (
        <TouchableOpacity
          key={key}
          style={styles.navItem}
          onPress={() => onPress(key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{icon}</Text>
          <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{label}</Text>
          {isActive && <View style={styles.navIndicator} />}
        </TouchableOpacity>
      );
    })}
  </View>
);

/**
 * Roteamento padrão da bottom nav. `home` usa popToTop para não empilhar uma
 * segunda Home quando o usuário volta de Sessões.
 */
export function useBottomNavHandler(navigation: any) {
  const { signOut } = useAuth();

  return useCallback(
    (key: NavKey) => {
      if (key === 'profile') {
        Alert.alert('Sair', 'Deseja encerrar a sessão?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
        ]);
        return;
      }
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
      }
    },
    [navigation, signOut],
  );
}
