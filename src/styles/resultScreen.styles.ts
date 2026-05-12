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