// src/screens/search/SearchScreen.tsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  FlatList,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { fieldStyles, progressStyles, styles } from '../../styles/searchScreen.styles';
import { useBrands, useModels, useTrims } from '../../hooks/useVehicles';
import type { ModelInfo } from '../../types/api';

type PickerMode = 'brand' | 'model' | 'year' | 'trim' | null;
interface PickerOption {
  value: string;
  label: string;
  subtitle?: string;
}

export const SearchScreen = ({ navigation }: any) => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTrim, setSelectedTrim] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const brandsQuery = useBrands();
  const modelsQuery = useModels(selectedBrand);
  const trimsQuery = useTrims(selectedBrand, selectedModel?.name ?? null, selectedYear);

  const tipAnim = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(tipAnim, {
      toValue: 1,
      delay: 300,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  const openPicker = useCallback(
    (mode: PickerMode) => {
      setPickerMode(mode);
      sheetAnim.setValue(0);
      Animated.spring(sheetAnim, {
        toValue: 1,
        tension: 70,
        friction: 12,
        useNativeDriver: true,
      }).start();
    },
    [sheetAnim],
  );

  const closePicker = useCallback(() => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setPickerMode(null));
  }, [sheetAnim]);

  const handleSelectBrand = useCallback(
    (brand: string) => {
      setSelectedBrand(brand);
      setSelectedModel(null);
      setSelectedYear(null);
      setSelectedTrim(null);
      closePicker();
    },
    [closePicker],
  );

  const handleSelectModel = useCallback(
    (model: ModelInfo) => {
      setSelectedModel(model);
      setSelectedYear(null);
      setSelectedTrim(null);
      closePicker();
    },
    [closePicker],
  );

  const handleSelectYear = useCallback(
    (year: number) => {
      setSelectedYear(year);
      setSelectedTrim(null);
      closePicker();
    },
    [closePicker],
  );

  const handleSelectTrim = useCallback(
    (trim: string) => {
      setSelectedTrim(trim);
      closePicker();
    },
    [closePicker],
  );

  const canContinue = !!selectedBrand && !!selectedModel && !!selectedYear && !!selectedTrim;

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    navigation?.navigate('Categories', {
      brand: selectedBrand,
      model: selectedModel!.name,
      trim: selectedTrim,
      year: selectedYear,
    });
  }, [canContinue, selectedBrand, selectedModel, selectedTrim, selectedYear, navigation]);

  const sortedYears = useMemo(() => {
    if (!selectedModel) return [];
    return [...selectedModel.years].sort((a, b) => b - a);
  }, [selectedModel]);

  const pickerOptions: PickerOption[] = useMemo(() => {
    if (pickerMode === 'brand') {
      return (brandsQuery.data ?? []).map((b) => ({ value: b, label: b }));
    }
    if (pickerMode === 'model') {
      return (modelsQuery.data ?? []).map((m) => ({
        value: m.name,
        label: m.name,
        subtitle: m.years.length ? `${m.years.length} ano(s) disponíveis` : undefined,
      }));
    }
    if (pickerMode === 'year') {
      return sortedYears.map((y) => ({ value: String(y), label: String(y) }));
    }
    if (pickerMode === 'trim') {
      return (trimsQuery.data ?? []).map((t) => ({ value: t, label: t }));
    }
    return [];
  }, [pickerMode, brandsQuery.data, modelsQuery.data, sortedYears, trimsQuery.data]);

  const pickerTitle =
    pickerMode === 'brand'
      ? 'Selecione a marca'
      : pickerMode === 'model'
        ? 'Selecione o modelo'
        : pickerMode === 'year'
          ? 'Selecione o ano'
          : 'Selecione a versão';

  const pickerLoading =
    (pickerMode === 'brand' && brandsQuery.isLoading) ||
    (pickerMode === 'model' && modelsQuery.isLoading) ||
    (pickerMode === 'trim' && trimsQuery.isLoading);

  const pickerError =
    (pickerMode === 'brand' && brandsQuery.error) ||
    (pickerMode === 'model' && modelsQuery.error) ||
    (pickerMode === 'trim' && trimsQuery.error);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova pesquisa</Text>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.instruction}>
          Informe o veículo que deseja pesquisar. A IA irá buscar dados em múltiplas fontes.
        </Text>
        <StepProgress steps={['Veículo', 'Categorias', 'Pesquisando', 'Resultado']} current={0} />

        <SelectField
          label="MARCA"
          placeholder="Selecione a marca"
          value={selectedBrand ?? undefined}
          filled={!!selectedBrand}
          disabled={brandsQuery.isLoading}
          onPress={() => openPicker('brand')}
        />
        <SelectField
          label="MODELO"
          placeholder={selectedBrand ? 'Selecione o modelo' : 'Selecione a marca primeiro'}
          value={selectedModel?.name}
          filled={!!selectedModel}
          disabled={!selectedBrand}
          onPress={() => selectedBrand && openPicker('model')}
        />
        <SelectField
          label="ANO"
          placeholder={selectedModel ? 'Selecione o ano' : 'Selecione o modelo primeiro'}
          value={selectedYear ? String(selectedYear) : undefined}
          filled={!!selectedYear}
          disabled={!selectedModel}
          onPress={() => selectedModel && openPicker('year')}
        />
        <SelectField
          label="VERSÃO"
          placeholder={selectedYear ? 'Selecione a versão' : 'Selecione o ano primeiro'}
          value={selectedTrim ?? undefined}
          filled={!!selectedTrim}
          disabled={!selectedYear}
          onPress={() => selectedYear && openPicker('trim')}
        />

        <Animated.View
          style={[
            styles.tipCard,
            {
              opacity: tipAnim,
              transform: [
                {
                  translateY: tipAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Dica</Text>
            <Text style={styles.tipText}>
              Selecione a versão mais próxima que deseja comparar com seus modelos.
            </Text>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={handleContinue}
          activeOpacity={canContinue ? 0.85 : 1}
          disabled={!canContinue}
        >
          <Text style={[styles.continueBtnText, !canContinue && styles.continueBtnTextDisabled]}>
            Continuar →
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={pickerMode !== null} transparent animationType="none" onRequestClose={closePicker}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closePicker} />
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: sheetAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }),
                },
              ],
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{pickerTitle}</Text>

          {pickerLoading ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : pickerError ? (
            <View style={{ paddingVertical: 32, alignItems: 'center', paddingHorizontal: 24 }}>
              <Text style={{ color: '#c0392b', textAlign: 'center' }}>
                Não foi possível carregar. Verifique sua conexão.
              </Text>
            </View>
          ) : pickerOptions.length === 0 ? (
            <View style={{ paddingVertical: 32, alignItems: 'center' }}>
              <Text style={{ color: theme.colors.textLight }}>Nenhum item disponível.</Text>
            </View>
          ) : (
            <FlatList
              data={pickerOptions}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              renderItem={({ item }) => {
                const isSelected =
                  (pickerMode === 'brand' && selectedBrand === item.value) ||
                  (pickerMode === 'model' && selectedModel?.name === item.value) ||
                  (pickerMode === 'year' && selectedYear === Number(item.value)) ||
                  (pickerMode === 'trim' && selectedTrim === item.value);
                return (
                  <TouchableOpacity
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => {
                      if (pickerMode === 'brand') handleSelectBrand(item.value);
                      else if (pickerMode === 'model') {
                        const m = (modelsQuery.data ?? []).find((x) => x.name === item.value);
                        if (m) handleSelectModel(m);
                      } else if (pickerMode === 'year') {
                        handleSelectYear(Number(item.value));
                      } else if (pickerMode === 'trim') handleSelectTrim(item.value);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                        {item.label}
                      </Text>
                      {item.subtitle ? (
                        <Text
                          style={[
                            styles.optionSubtitle,
                            isSelected && styles.optionSubtitleSelected,
                          ]}
                        >
                          {item.subtitle}
                        </Text>
                      ) : null}
                    </View>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value?: string;
  subValue?: string;
  filled: boolean;
  disabled: boolean;
  onPress: () => void;
}
const SelectField: React.FC<SelectFieldProps> = ({
  label,
  placeholder,
  value,
  subValue,
  filled,
  disabled,
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

interface StepProgressProps {
  steps: string[];
  current: number;
}
const StepProgress: React.FC<StepProgressProps> = ({ steps, current }) => (
  <View style={progressStyles.container}>
    {steps.map((step, i) => (
      <React.Fragment key={step}>
        <View style={progressStyles.item}>
          <View
            style={[
              progressStyles.dot,
              i === current && progressStyles.dotActive,
              i < current && progressStyles.dotDone,
            ]}
          >
            {i < current ? (
              <Text style={progressStyles.dotCheck}>✓</Text>
            ) : (
              <Text style={[progressStyles.dotNum, i === current && progressStyles.dotNumActive]}>
                {i + 1}
              </Text>
            )}
          </View>
          <Text
            style={[
              progressStyles.label,
              i === current && progressStyles.labelActive,
              i < current && progressStyles.labelDone,
            ]}
          >
            {step}
          </Text>
        </View>
        {i < steps.length - 1 && (
          <View style={[progressStyles.line, i < current && progressStyles.lineDone]} />
        )}
      </React.Fragment>
    ))}
  </View>
);
