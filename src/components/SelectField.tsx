// src/components/SelectField.tsx
// Campo de seleção (abre um bottom sheet ao ser tocado).
// Usado na SearchScreen (marca/modelo/ano/versão) e no seletor de sessão.
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { fieldStyles } from '../styles/searchScreen.styles';

export interface SelectFieldProps {
  label: string;
  placeholder: string;
  value?: string;
  subValue?: string;
  filled: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  placeholder,
  value,
  subValue,
  filled,
  disabled = false,
  onPress,
}) => (
  <View style={fieldStyles.wrap}>
    <Text style={fieldStyles.label}>{label}</Text>
    <TouchableOpacity
      style={[
        fieldStyles.field,
        filled && fieldStyles.fieldFilled,
        disabled && fieldStyles.fieldDisabled,
      ]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.75}
      disabled={disabled}
    >
      <View style={fieldStyles.left}>
        <Text
          style={[
            fieldStyles.value,
            !value && fieldStyles.placeholder,
            disabled && fieldStyles.disabledText,
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        {subValue ? (
          <Text style={fieldStyles.subValue} numberOfLines={1}>
            {subValue}
          </Text>
        ) : null}
      </View>
      <Text style={[fieldStyles.chevron, disabled && { opacity: 0.3 }]}>▾</Text>
    </TouchableOpacity>
  </View>
);
