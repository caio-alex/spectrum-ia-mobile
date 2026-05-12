import { StyleSheet } from "react-native";
import { theme } from "./theme";
import { Platform } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  // Header
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  backArrow: {
    fontSize: 14,
    color: 'rgba(131,192,255,0.9)',
    fontWeight: '500',
    flexShrink: 0,
  },
  backVehicle: {
    fontSize: 11,
    color: 'rgba(131,192,255,0.9)',
    fontWeight: '500',
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },

  // Body
  body: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bodyContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },

  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  instruction: {
    fontSize: 12,
    color: theme.colors.textLight,
    lineHeight: 16,
    flex: 1,
  },
  selectAllBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexShrink: 0,
  },
  selectAllBtnActive: {
    backgroundColor: 'rgba(0,24,129,0.08)',
    borderColor: theme.colors.primary,
  },
  selectAllText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
  selectAllTextActive: {
    color: theme.colors.primary,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  cardWrapper: {
    width: '47.5%',
  },

  // Category card
  catCard: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: theme.colors.surface,
    position: 'relative',
    minHeight: 108,
  },
  catCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0,24,129,0.06)',
  },
  catCheck: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catCheckSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  catCheckMark: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
    lineHeight: 11,
  },
  catEmoji: {
    fontSize: 22,
    marginBottom: 6,
    marginTop: 2,
  },
  catName: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  catNameSelected: {
    color: theme.colors.primary,
  },
  catSubtitle: {
    fontSize: 9.5,
    color: theme.colors.textLight,
    lineHeight: 13,
    marginBottom: 8,
  },
  catSubtitleSelected: {
    color: theme.colors.primary,
    opacity: 0.7,
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  catBadgeSelected: {
    backgroundColor: 'rgba(0,24,129,0.1)',
    borderColor: 'rgba(0,24,129,0.25)',
  },
  catBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textLight,
  },
  catBadgeTextSelected: {
    color: theme.colors.primary,
  },

  // Estimate card
  estimateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(131,192,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(131,192,255,0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  estimateIcon: { fontSize: 20 },
  estimateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 1,
  },
  estimateSubtitle: {
    fontSize: 10,
    color: theme.colors.primary,
    opacity: 0.7,
  },

  // Start button
  startBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  startBtnDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  startBtnTextDisabled: {
    color: theme.colors.textMuted,
  },
});