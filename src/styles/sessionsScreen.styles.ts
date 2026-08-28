import { Platform, StyleSheet } from 'react-native';
import { theme } from './theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  // ── Header ────────────────────────────────────────────────────────────
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 14 : 8,
    paddingBottom: 14,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: 'rgba(131,192,255,0.9)',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(131,192,255,0.85)',
    marginTop: 4,
  },
  headerSessionName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    flex: 1,
  },

  // ── Corpo ─────────────────────────────────────────────────────────────
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

  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    boxShadow: '0px 6px 12px rgba(0, 24, 129, 0.35)',
  },
  primaryBtnPlus: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '300',
  },
  primaryBtnLabel: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  // ── Cartão de contexto da sessão (detalhe) ───────────────────────────
  sessionMetaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 18,
  },
  sessionMetaDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 19,
    marginBottom: 8,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionMetaLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    flex: 1,
  },
  sessionMetaBadge: {
    backgroundColor: theme.colors.secondaryAlpha35,
    borderRadius: theme.radii.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sessionMetaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // ── Estados ───────────────────────────────────────────────────────────
  stateBox: {
    paddingVertical: 28,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stateEmoji: { fontSize: 34, marginBottom: 10 },
  stateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  stateText: {
    color: theme.colors.textLight,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 19,
  },
  stateError: {
    color: '#c0392b',
    textAlign: 'center',
    fontSize: 14,
  },
});
