// src/components/ui/Checkbox.tsx
//
// Caixa de seleção com rótulo clicável.
//
// Nasceu para o aceite da LGPD, e por isso tem uma regra que não é negociável:
// NÃO existe prop de valor inicial. O consentimento da LGPD (Art. 8º) precisa
// ser uma manifestação livre e inequívoca — caixa pré-marcada não é aceite, é
// presunção. Quem usa este componente decide o estado, mas a ausência de um
// `defaultChecked` deixa a intenção explícita para quem vier depois.
//
// A área de toque cobre a linha inteira: em consentimento, um alvo pequeno é
// exatamente o tipo de atrito que empurra o usuário a clicar sem ler.

import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { Icon } from './Icon';
import { PressableScale } from './Pressable';
import { Txt } from './Txt';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Texto ou nós — use nós quando houver links dentro do rótulo. */
  children: React.ReactNode;
  /** Descrição do estado para leitores de tela. */
  accessibilityLabel: string;
  /** Marca a caixa em vermelho e exibe a mensagem abaixo. */
  error?: string | null;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Checkbox: React.FC<Props> = ({
  checked,
  onChange,
  children,
  accessibilityLabel,
  error,
  disabled = false,
  style,
}) => (
  <View style={style}>
    <PressableScale
      onPress={() => onChange(!checked)}
      disabled={disabled}
      scaleTo={0.985}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      // O RN Web não deriva aria-checked de accessibilityState; sem isto o
      // leitor de tela anuncia a caixa mas não diz se está marcada.
      aria-checked={checked}
      accessibilityLabel={accessibilityLabel}
      style={styles.row}
    >
      <View
        style={[
          styles.box,
          checked && styles.boxChecked,
          !!error && !checked && styles.boxError,
          disabled && styles.boxDisabled,
        ]}
      >
        {checked ? <Icon name="check" size={11} color="#FFFFFF" /> : null}
      </View>

      <View style={styles.label}>
        {typeof children === 'string' ? (
          <Txt variant="caption" tone="muted">
            {children}
          </Txt>
        ) : (
          children
        )}
      </View>
    </PressableScale>

    {error ? (
      <View style={styles.errorRow}>
        <Icon name="warning" size={10} color={theme.colors.danger} />
        <Txt variant="micro" tone="danger" style={{ flex: 1 }}>
          {error}
        </Txt>
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[3],
    // Padding vertical generoso: a linha inteira é o alvo de toque.
    paddingVertical: theme.space[2],
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.xs,
    borderWidth: 1.5,
    borderColor: theme.ink[300],
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    // Alinha com a primeira linha do rótulo.
    marginTop: 1,
  },
  boxChecked: {
    backgroundColor: theme.brand[700],
    borderColor: theme.brand[700],
  },
  boxError: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerBg,
  },
  boxDisabled: {
    backgroundColor: theme.ink[50],
    borderColor: theme.ink[200],
  },
  label: {
    flex: 1,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
    marginLeft: 22 + theme.space[3],
  },
});
