import { Platform, StyleSheet } from 'react-native';
import { theme } from './theme';

export const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 6,
    boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.04)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.45,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textLight,
    letterSpacing: 0.1,
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  navIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});
