import { StyleSheet } from "react-native";
import { theme } from "./theme";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primary },
  header: { padding: 20, paddingBottom: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backBtn: { color: '#fff', fontSize: 24 },
  pdfBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 8 },
  pdfIcon: { fontSize: 18 },
  vehicleInfo: { marginBottom: 20 },
  brandText: { color: theme.colors.secondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  modelText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  yearBadge: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginRight: 10 },
  yearText: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  sourceCount: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  statsContainer: { gap: 12 },
  content: { flex: 1, backgroundColor: theme.colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  scrollPadding: { padding: 20, paddingBottom: 100 },
  insightCard: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: 16, flexDirection: 'row', gap: 12, marginBottom: 25 },
  insightEmoji: { fontSize: 24 },
  insightText: { flex: 1, fontSize: 13, color: theme.colors.text, lineHeight: 18 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.textLight, letterSpacing: 1, marginBottom: 15 },
  compareFab: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  compareFabText: { color: '#fff', fontWeight: '700' }
});

export const sourceStyles = StyleSheet.create({
  // Seção wrapper
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: theme.colors.surface,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.1,
  },
  sectionSub: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginTop: 1,
  },

  // Lista
  list: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },

  // Item individual
  item: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexShrink: 0,
  },
  icon: {
    fontSize: 15,
  },
  headerContent: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  fields: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 13,
    color: theme.colors.textMuted,
    flexShrink: 0,
  },

  // Conteúdo expandido
  expanded: {
    marginTop: 10,
    paddingLeft: 44,
  },
  urlText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  quoteBox: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.secondary,
    paddingLeft: 10,
  },
  quoteText: {
    fontSize: 11,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    lineHeight: 17,
  },
});