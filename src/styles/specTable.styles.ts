import { StyleSheet } from "react-native";
import { theme } from "./theme";

export const styles = StyleSheet.create({
  tableContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    marginBottom: 20,
    overflow: 'hidden'
  },
  categoryTitle: { 
    backgroundColor: theme.colors.surface, 
    padding: 12, 
    fontSize: 11, 
    fontWeight: '700', 
    color: theme.colors.primary,
    textTransform: 'uppercase'
  },
  row: { 
    flexDirection: 'row', 
    padding: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border 
  },
  labelCol: { flex: 1, justifyContent: 'center' },
  label: { fontSize: 13, color: theme.colors.textLight, marginBottom: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  valueCol: { flex: 2, alignItems: 'flex-end' },
  value: { fontSize: 14, fontWeight: '600', color: theme.colors.text, textAlign: 'right' },
  source: { fontSize: 10, color: theme.colors.textLight, marginTop: 4 }
});