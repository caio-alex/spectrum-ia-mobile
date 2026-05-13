// src/styles/compareScreen.styles.ts
import { StyleSheet, Dimensions } from 'react-native';
import { theme } from './theme';

const { width: W } = Dimensions.get('window');
const CARD_W = W * 0.42;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  // ── Header ────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: theme.colors.primary,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
  },
  backArrow: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    color: 'rgba(131,192,255,0.85)',
    marginTop: 1,
  },
  highlightToggle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  highlightToggleActive: {
    backgroundColor: 'rgba(255,215,0,0.25)',
    borderColor: 'rgba(255,215,0,0.5)',
  },
  highlightToggleText: {
    fontSize: 16,
    opacity: 0.4,
  },
  highlightToggleTextActive: {
    opacity: 1,
  },

  // ── Content wrapper ───────────────────────────────────────────────────
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  // ── Vehicle selector ──────────────────────────────────────────────────
  vehicleSelector: {
    paddingTop: 18,
    paddingBottom: 6,
    backgroundColor: theme.colors.background,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  vehicleListContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: 5,
  },
  vehicleChipSelected: {
    backgroundColor: 'rgba(0,24,129,0.07)',
    borderColor: theme.colors.primary,
  },
  vehicleChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vehicleChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textLight,
    maxWidth: 130,
  },
  vehicleChipTextSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  vehicleChipCheck: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '700',
  },

  // ── Vehicle cards ──────────────────────────────────────────────────────
  vehicleCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    gap: 10,
  },
  vehicleCard: {
    width: CARD_W,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    borderTopWidth: 3,
    flex: 1,
  },
  vehicleImageContainer: {
    height: 100,
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
  },
  vehicleImageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1,
  },
  vehicleBrandBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vehicleBrandBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vehicleCardInfo: {
    padding: 10,
  },
  vehicleCardModel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },
  vehicleCardVersion: {
    fontSize: 9.5,
    color: theme.colors.textLight,
    marginTop: 1,
    lineHeight: 13,
  },
  vehicleCardYear: {
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  vehicleScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 5,
  },
  vehicleScoreBadge: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  vehicleScoreText: {
    fontSize: 9,
    fontWeight: '700',
  },
  vehicleFieldsCount: {
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  vehiclePrice: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginTop: 6,
  },

  // ── Score bar ──────────────────────────────────────────────────────────
  scoreBarContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreBarTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 12,
  },
  scoreBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  scoreBarLabel: {
    fontSize: 11,
    color: theme.colors.text,
    width: 90,
    flexShrink: 0,
  },
  scoreBarBars: {
    flex: 1,
    gap: 4,
  },
  scoreBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreBarValue: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text,
    width: 24,
    textAlign: 'right',
  },

  // ── Category filter (sticky) ───────────────────────────────────────────
  categoryFilter: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 10,
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
    gap: 7,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
  categoryChipTextActive: {
    color: '#fff',
  },

  // ── Spec sections ──────────────────────────────────────────────────────
  specSection: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: 4,
  },
  specSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  specSectionEmoji: {
    fontSize: 16,
  },
  specSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // ── Spec rows ─────────────────────────────────────────────────────────
  specRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '80',
    backgroundColor: '#fff',
  },
  specRowLabel: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.textLight,
    lineHeight: 15,
    paddingRight: 8,
  },
  specRowValues: {
    flexDirection: 'row',
    gap: 4,
    flex: 1.8,
    justifyContent: 'flex-end',
  },
  specRowValue: {
    alignItems: 'flex-end',
    minHeight: 28,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specRowValueWinner: {
    backgroundColor: 'rgba(26,110,26,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(26,110,26,0.2)',
  },
  specRowValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'right',
  },
  specRowValueTextWinner: {
    color: '#1a6e1a',
    fontWeight: '700',
  },
  specRowValueEmpty: {
    color: theme.colors.textMuted,
    fontWeight: '400',
    fontStyle: 'italic',
  },
  specWinnerBadge: {
    fontSize: 9,
    marginTop: 1,
  },
  specConfidenceDot: {
    fontSize: 9,
    color: theme.colors.warning,
    fontWeight: '700',
  },

  // ── Buy section ───────────────────────────────────────────────────────
  buySection: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  buySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  buySectionSub: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 14,
    lineHeight: 18,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  buyBtnIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtnEmoji: {
    fontSize: 20,
  },
  buyBtnContent: {
    flex: 1,
  },
  buyBtnModel: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
  },
  buyBtnInfo: {
    fontSize: 10.5,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  buyBtnArrow: {
    fontSize: 18,
    color: theme.colors.textMuted,
  },
});
