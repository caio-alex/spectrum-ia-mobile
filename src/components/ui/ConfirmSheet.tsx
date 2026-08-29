// src/components/ui/ConfirmSheet.tsx
//
// Confirmação de ação dentro do app, no lugar de `Alert.alert`.
//
// Motivo técnico: no React Native Web o `Alert` é literalmente um no-op
// (`static alert() {}`). Toda confirmação montada sobre ele — sair da conta,
// cancelar a pesquisa — simplesmente não acontecia na versão web: o botão
// parecia quebrado porque o diálogo nunca abria.
//
// Motivo de produto: mesmo funcionando no nativo, o diálogo do sistema tem a
// cara do sistema. Confirmar uma ação destrutiva é um dos poucos momentos em
// que o app pede atenção total — vale ser o app falando, com a tipografia e as
// cores dele.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme, withAlpha } from '../../styles/theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Sheet } from './Sheet';
import { Txt } from './Txt';

interface Props {
  visible: boolean;
  title: string;
  description?: string;
  /** Texto do botão que executa a ação. */
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** `destructive` pinta a confirmação de vermelho. */
  tone?: 'destructive' | 'neutral';
  icon?: IconName;
  loading?: boolean;
}

export const ConfirmSheet: React.FC<Props> = ({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  tone = 'destructive',
  icon,
  loading = false,
}) => {
  const accent = tone === 'destructive' ? theme.colors.danger : theme.brand[600];

  return (
    <Sheet
      visible={visible}
      onClose={onCancel}
      locked={loading}
      maxHeightRatio={0.6}
      // Sem título no cabeçalho do sheet: aqui ele entra ao lado do ícone,
      // para o alerta ler como um bloco só.
    >
      <View style={styles.head}>
        <View style={[styles.badge, { backgroundColor: withAlpha(accent, 0.12) }]}>
          <Icon
            name={icon ?? (tone === 'destructive' ? 'warning' : 'info')}
            size={20}
            color={accent}
          />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt variant="title2">{title}</Txt>
          {description ? (
            <Txt variant="caption" tone="muted">
              {description}
            </Txt>
          ) : null}
        </View>
      </View>

      <Button
        label={confirmLabel}
        variant={tone === 'destructive' ? 'dangerSolid' : 'primary'}
        onPress={onConfirm}
        loading={loading}
        style={{ marginTop: theme.space[5] }}
      />
      <Button
        label={cancelLabel}
        variant="ghost"
        onPress={onCancel}
        disabled={loading}
        style={{ marginTop: theme.space[2] }}
      />
    </Sheet>
  );
};

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[4],
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
