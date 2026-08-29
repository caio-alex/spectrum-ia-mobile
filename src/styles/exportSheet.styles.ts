import { StyleSheet } from 'react-native';
import { theme } from './theme';

// ── Bottom sheet de exportação (Baixar PDF / CSV) ───────────────────────────
export const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 18,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: 12,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionTextBox: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  optionSubtitle: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 1,
  },
  error: {
    fontSize: 12,
    color: '#c0392b',
    marginBottom: 4,
    marginTop: -4,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
});
