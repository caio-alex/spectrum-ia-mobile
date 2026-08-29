import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryAlpha08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: { fontSize: 20 },
  content: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textLight,
    flex: 1,
  },
  countBadge: {
    backgroundColor: theme.colors.secondaryAlpha35,
    borderRadius: theme.radii.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.textMuted,
    marginLeft: 2,
  },
});
