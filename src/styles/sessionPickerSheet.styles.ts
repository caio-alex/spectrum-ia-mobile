import { StyleSheet } from 'react-native';
import { theme } from './theme';

export const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    // Deixa o toque chegar ao overlay atrás (fecha o sheet); só o sheet captura.
    pointerEvents: 'box-none',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
    maxHeight: '80%',
    boxShadow: '0px -4px 20px rgba(0, 0, 0, 0.12)',
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
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textLight,
    marginTop: 2,
    marginBottom: 12,
  },

  // ── Linha "criar nova sessão" ───────────────────────────────────────────
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
    backgroundColor: 'rgba(131,192,255,0.10)',
    marginBottom: 10,
  },
  createRowPlus: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '300',
    color: theme.colors.primary,
  },
  createRowLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // ── Itens da lista ──────────────────────────────────────────────────────
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  itemSelected: { backgroundColor: 'rgba(0,24,129,0.07)' },
  itemLeft: { flex: 1 },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  itemNameSelected: { color: theme.colors.primary, fontWeight: '700' },
  itemMeta: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  itemMetaSelected: { color: theme.colors.primary, opacity: 0.7 },
  checkMark: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
    marginLeft: 8,
  },

  // ── Estados ─────────────────────────────────────────────────────────────
  stateBox: { paddingVertical: 28, alignItems: 'center', paddingHorizontal: 12 },
  stateText: { color: theme.colors.textLight, textAlign: 'center', fontSize: 14 },
  stateError: { color: '#c0392b', textAlign: 'center', fontSize: 14 },

  // ── Formulário de criação ───────────────────────────────────────────────
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  inputMultiline: {
    minHeight: 74,
    textAlignVertical: 'top',
  },
  inputFilled: {
    borderColor: theme.colors.secondary,
    backgroundColor: 'rgba(131,192,255,0.08)',
  },
  counter: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  fieldWrap: { marginBottom: 12 },
  formError: {
    fontSize: 13,
    color: '#c0392b',
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBtnTextDisabled: {
    color: theme.colors.textMuted,
  },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: theme.colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
});
