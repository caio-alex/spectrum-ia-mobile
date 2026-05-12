import { StyleSheet } from "react-native";
import { theme } from "./theme";
import { Platform } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(131,192,255,0.8)',
    marginTop: 2,
  },

  body: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bodyContent: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },

  // Spinner section
  spinnerSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  spinnerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: 'transparent',
    borderTopColor: theme.colors.secondary,
    borderRightColor: theme.colors.secondary,
  },
  spinnerRingDot: {
    position: 'absolute',
    top: -3,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  spinnerInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,24,129,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,24,129,0.15)',
  },
  spinnerInnerEmoji: { fontSize: 22 },
  spinnerDone: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.success,
    marginBottom: 14,
  },
  spinnerDoneEmoji: {
    fontSize: 28,
    color: theme.colors.success,
    fontWeight: '700',
  },
  spinnerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  spinnerSubtitle: {
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Progress bar
  progressBar: {
    width: '100%',
    height: 5,
    backgroundColor: theme.colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },

  // Categories pills
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  categoryPill: {
    backgroundColor: 'rgba(0,24,129,0.07)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,24,129,0.15)',
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },

  // Sources list
  sourcesTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  sourcesList: {
    marginBottom: 16,
  },

  // Cancel
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});