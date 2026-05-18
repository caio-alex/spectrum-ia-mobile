import { StyleSheet } from "react-native";
import { theme } from "./theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  header: {
    height: '22%',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  vehicleContext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,24,129,0.06)', // Subtil tom de overlay
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    height: '92%', // Ocupa a maior parte do espaço restante
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fieldLeft: {
    flex: 1,
  },
  fieldCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  fieldRight: {
    alignItems: 'flex-end',
  },
  fieldValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 24,
  },
  sourceTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sourceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceName: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: 8,
  },
  sourceUrl: {
    fontFamily: 'monospace', // Se adicionares o JetBrains Mono depois, altera aqui
    fontSize: 10,
    color: theme.colors.primary,
    marginBottom: 12,
    opacity: 0.8,
  },
  quoteBox: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.secondary,
    paddingLeft: 12,
  },
  sourceQuote: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  warningCard: {
    backgroundColor: '#fff4e3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  warningText: {
    fontSize: 11,
    color: '#c06000',
    lineHeight: 16,
    marginLeft: 10,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 40,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});