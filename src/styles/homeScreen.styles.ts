import { StyleSheet } from "react-native";
import { theme } from "./theme";
import { Platform } from "react-native";

export const fabIconStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  carA:      { alignItems: 'center', gap: 2 },
  carB:      { alignItems: 'center', gap: 2 },
  carBody: {
    width: 14,
    height: 8,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  wheelRow:  { flexDirection: 'row', gap: 5 },
  wheel: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  arrows: { color: '#fff', fontSize: 12, lineHeight: 14 },
});

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  // Header
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 12,
    color: 'rgba(131,192,255,0.85)',
    fontWeight: '400',
    marginBottom: 2,
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerLogoAccent: {
    color: theme.colors.secondary,
  },
  // Adicionar junto aos outros styles do Header
  logoContainer: {
    width: '100%',         // largura fixa do container
    height: 30,         // altura fixa — controla o espaço vertical
    justifyContent: 'center',
    paddingBottom: 8
  },
  logoImage: {
    width: '100%',      // preenche o container
    height: '100%',     // preenche o container
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.secondaryAlpha35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(131,192,255,0.4)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Scroll
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },

  // Nova pesquisa
  newSearchBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  newSearchPlus: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '300',
  },
  newSearchLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  // Seção
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionAction: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // FAB
  fabWrapper: {
    position: 'absolute',
    right: 16,
    bottom: 68, // acima da bottom nav (52px) + margem
    alignItems: 'flex-end',
  },
  fabTooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabTooltip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  fabTooltipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.45,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: theme.colors.textLight,
    letterSpacing: 0.1,
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  navIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});