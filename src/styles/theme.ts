// src/styles/theme.ts
export const theme = {
  colors: {
    primary: '#001881',        // Azul escuro corporativo
    secondary: '#83c0ff',      // Azul claro de destaque
    background: '#FFFFFF',
    surface: '#f4f6fb',        // Cinza azulado para cards
    surfaceHover: '#edf0f8',
    text: '#1e1e1e',
    textLight: '#6b7491',
    textMuted: '#b0b8cc',
    success: '#1a6e1a',
    successBg: '#e3f0e3',
    warning: '#c06000',
    warningBg: '#fff4e3',
    border: '#e6eaf5',
    borderStrong: '#b0b8cc',
    primaryAlpha08: 'rgba(0,24,129,0.08)',
    primaryAlpha15: 'rgba(0,24,129,0.15)',
    secondaryAlpha15: 'rgba(131,192,255,0.15)',
    secondaryAlpha35: 'rgba(131,192,255,0.35)',
  },
  fonts: {
    regular: 'Sora_400Regular',
    bold: 'Sora_700Bold',
  },
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
  },
} as const;