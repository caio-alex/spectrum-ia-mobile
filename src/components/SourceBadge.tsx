// src/components/SourceBadge.tsx
// Badge de fonte dos dados: Oficial | Review | Estimado
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';
import type { SourceTag } from '../mocks/homeData';
import { styles } from '../styles/sourceBadge.styles';
interface Props {
  tag: SourceTag;
  small?: boolean;
}

const CONFIG: Record<SourceTag, { label: string; bg: string; fg: string }> = {
  Oficial:  { label: 'Oficial',   bg: theme.colors.successBg, fg: theme.colors.success  },
  Review:   { label: 'Review',    bg: theme.colors.warningBg, fg: theme.colors.warning   },
  Estimado: { label: 'Estimado',  bg: '#edf0fb',              fg: theme.colors.primary   },
};

export const SourceBadge: React.FC<Props> = ({ tag, small = false }) => {
  const { label, bg, fg } = CONFIG[tag];
  return (
    <View style={[styles.badge, { backgroundColor: bg }, small && styles.small]}>
      <Text style={[styles.text, { color: fg }, small && styles.smallText]}>
        {label}
      </Text>
    </View>
  );
};

