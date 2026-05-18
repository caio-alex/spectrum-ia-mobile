import { StyleSheet } from "react-native";
import { theme } from "./theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 12,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 8,
    color: theme.colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
});