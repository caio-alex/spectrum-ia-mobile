// src/components/ui/Field.tsx
//
// Campos de formulário e de seleção.
//
// O detalhe que muda a sensação de qualidade aqui é o foco: a borda ganha a cor
// da marca e um halo suave. Sem isso o usuário não sabe onde está digitando —
// era o caso dos inputs antigos, que só tinham uma borda cinza fixa.

import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { theme } from '../../styles/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './Pressable';
import { Eyebrow, Txt } from './Txt';

/* ── Field: rótulo + conteúdo + mensagem de apoio ────────────────────────── */

interface FieldProps {
  label?: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Contador de caracteres, alinhado à direita do rótulo. */
  counter?: string;
}

export const Field: React.FC<FieldProps> = ({ label, hint, error, children, style, counter }) => (
  <View style={[{ marginBottom: theme.space[4] }, style]}>
    {label || counter ? (
      <View style={styles.labelRow}>
        {label ? <Eyebrow>{label}</Eyebrow> : <View />}
        {counter ? (
          <Txt variant="micro" tone="faint">
            {counter}
          </Txt>
        ) : null}
      </View>
    ) : null}
    {children}
    {error ? (
      <View style={styles.messageRow}>
        <Icon name="warning" size={10} color={theme.colors.danger} />
        <Txt variant="micro" tone="danger" style={{ flex: 1 }}>
          {error}
        </Txt>
      </View>
    ) : hint ? (
      <Txt variant="micro" tone="faint" style={{ marginTop: 6 }}>
        {hint}
      </Txt>
    ) : null}
  </View>
);

/* ── TextField ───────────────────────────────────────────────────────────── */

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  hint?: string;
  error?: string | null;
  icon?: IconName;
  counter?: string;
  /** Botão de mostrar/ocultar para campos de senha. */
  revealable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  multilineHeight?: number;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  hint,
  error,
  icon,
  counter,
  revealable,
  containerStyle,
  multilineHeight,
  multiline,
  ...input
}) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const filled = !!input.value;

  return (
    <Field label={label} hint={hint} error={error} counter={counter} style={containerStyle}>
      <View
        style={[
          styles.inputBox,
          multiline && { height: multilineHeight ?? 92, alignItems: 'flex-start', paddingTop: 12 },
          filled && styles.inputBoxFilled,
          focused && styles.inputBoxFocused,
          !!error && styles.inputBoxError,
        ]}
      >
        {icon ? (
          <Icon
            name={icon}
            size={15}
            color={focused ? theme.brand[600] : theme.ink[400]}
            style={multiline ? { marginTop: 3 } : undefined}
          />
        ) : null}
        <TextInput
          {...input}
          multiline={multiline}
          secureTextEntry={revealable ? hidden : input.secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          placeholderTextColor={theme.ink[300]}
          style={[styles.input, multiline && { height: '100%', textAlignVertical: 'top' }]}
        />
        {revealable ? (
          <PressableScale
            onPress={() => setHidden((v) => !v)}
            scaleTo={0.86}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
            style={styles.reveal}
          >
            <Txt variant="micro" tone="accent" style={{ fontFamily: theme.fonts.semibold }}>
              {hidden ? 'Mostrar' : 'Ocultar'}
            </Txt>
          </PressableScale>
        ) : null}
      </View>
    </Field>
  );
};

/* ── SelectRow ───────────────────────────────────────────────────────────── */

interface SelectRowProps {
  label: string;
  placeholder: string;
  value?: string | null;
  subValue?: string | null;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Linha de seleção que abre um sheet. O estado preenchido troca a moldura para
 * a cor da marca — num fluxo encadeado (marca → modelo → ano → versão) isso é o
 * que deixa o progresso visível sem precisar de texto extra.
 */
export const SelectRow: React.FC<SelectRowProps> = ({
  label,
  placeholder,
  value,
  subValue,
  icon,
  disabled = false,
  loading = false,
  onPress,
  style,
}) => {
  const filled = !!value;
  return (
    <View style={[{ marginBottom: theme.space[3] }, style]}>
      <Eyebrow style={{ marginBottom: 7 }} tone={disabled ? 'faint' : 'muted'}>
        {label}
      </Eyebrow>
      <PressableScale
        onPress={onPress}
        disabled={disabled || loading}
        scaleTo={0.985}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ?? placeholder}`}
        accessibilityState={{ disabled }}
        style={[
          styles.selectBox,
          filled && styles.selectBoxFilled,
          disabled && styles.selectBoxDisabled,
        ]}
      >
        {icon ? (
          <View style={[styles.selectIcon, filled && { backgroundColor: theme.brand[100] }]}>
            <Icon
              name={icon}
              size={14}
              color={disabled ? theme.ink[300] : filled ? theme.brand[700] : theme.ink[400]}
            />
          </View>
        ) : null}
        <View style={{ flex: 1, gap: 1 }}>
          <Txt
            variant={filled ? 'bodyStrong' : 'body'}
            tone={disabled ? 'faint' : filled ? 'default' : 'faint'}
            numberOfLines={1}
          >
            {value || placeholder}
          </Txt>
          {subValue ? (
            <Txt variant="micro" tone="muted" numberOfLines={1}>
              {subValue}
            </Txt>
          ) : null}
        </View>
        <Icon
          name="chevronDown"
          size={11}
          color={disabled ? theme.ink[200] : filled ? theme.brand[600] : theme.ink[400]}
        />
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: 52,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    borderColor: theme.ink[100],
    backgroundColor: theme.ink[50],
  },
  inputBoxFilled: {
    backgroundColor: theme.colors.card,
    borderColor: theme.ink[200],
  },
  inputBoxFocused: {
    backgroundColor: theme.colors.card,
    borderColor: theme.brand[500],
    boxShadow: '0px 0px 0px 3px rgba(46, 91, 240, 0.12)',
  },
  inputBoxError: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerBg,
  },
  input: {
    flex: 1,
    ...theme.type.body,
    color: theme.colors.text,
    paddingVertical: 0,
  },
  reveal: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: 58,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    borderColor: theme.ink[100],
    backgroundColor: theme.ink[50],
  },
  selectBoxFilled: {
    backgroundColor: theme.colors.card,
    borderColor: theme.brand[300],
    ...theme.shadow.xs,
  },
  selectBoxDisabled: {
    backgroundColor: theme.ink[25],
    borderColor: theme.ink[100],
    borderStyle: 'dashed',
  },
  selectIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.ink[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
