import { StyleSheet } from "react-native";
import { theme } from "./theme";
import { Platform } from "react-native";

export const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  field: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldFilled: {
    borderColor: theme.colors.secondary,
    backgroundColor: 'rgba(131,192,255,0.08)',
  },
  fieldDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.surface,
  },
  left: { flex: 1 },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.textMuted,
    fontWeight: '400',
    fontSize: 13,
  },
  subValue: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: 1,
  },
  disabledText: { color: theme.colors.textMuted },
  chevron: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
});



export const progressStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  item: { alignItems: 'center', gap: 4 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dotDone: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  dotCheck: { fontSize: 10, color: '#fff', fontWeight: '700' },
  dotNum: { fontSize: 9, color: theme.colors.textMuted, fontWeight: '700' },
  dotNumActive: { color: '#fff' },
  label: {
    fontSize: 8,
    color: theme.colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelActive: { color: theme.colors.primary, fontWeight: '700' },
  labelDone: { color: theme.colors.success, fontWeight: '600' },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  lineDone: { backgroundColor: theme.colors.success },
});

// ── Styles principais ─────────────────────────────────────────────────────
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
    gap: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 14,
    color: 'rgba(131,192,255,0.9)',
    fontWeight: '500',
  },
  backLabel: {
    fontSize: 11,
    color: 'rgba(131,192,255,0.9)',
    fontWeight: '500',
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
  instruction: {
    fontSize: 12,
    color: theme.colors.textLight,
    lineHeight: 18,
    marginBottom: 18,
  },

  // Tip card
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(131,192,255,0.1)',
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
    alignItems: 'flex-start',
  },
  tipIcon: { fontSize: 16, marginTop: 1 },
  tipContent: { flex: 1 },
  tipTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 11,
    color: theme.colors.primary,
    opacity: 0.8,
    lineHeight: 16,
  },

  // Continue button
  continueBtn: {
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
  continueBtnDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  continueBtnTextDisabled: {
    color: theme.colors.textMuted,
  },

  // Modal overlay
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  // Option items
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  optionItemSelected: {
    backgroundColor: 'rgba(0,24,129,0.07)',
  },
  optionLeft: { flex: 1 },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  optionSubtitleSelected: {
    color: theme.colors.primary,
    opacity: 0.7,
  },
  checkMark: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
    marginLeft: 8,
  },
});