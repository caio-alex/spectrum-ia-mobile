// src/screens/search/SearchScreen.tsx
//
// TELA 03 — NOVA PESQUISA
// Fiel ao mockup: header com voltar, seleção de Marca → Modelo → Versão,
// card dica e botão Continuar que leva para Categorias.
//
// Dados: marcas/modelos/versões mockados em /src/mocks/vehicleData.ts
// Integração real: GET /api/v1/vehicles/brands, /models, /versions

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  FlatList,
  Animated,
  Platform,
} from 'react-native';
import { theme } from '../../styles/theme';
import {
  VEHICLE_BRANDS,
  getModelsByBrand,
  getVersionsByModel,
  type VehicleBrand,
  type VehicleModel,
  type VehicleVersion,
} from '../../mocks/vehicleData';
import { fieldStyles, progressStyles, styles } from '../../styles/searchScreen.styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons/faLightbulb';
// ── Props ─────────────────────────────────────────────────────────────────
interface Props {
  navigation?: any;
}

// ── Types ─────────────────────────────────────────────────────────────────
type PickerMode = 'brand' | 'model' | 'version' | null;

interface PickerOption {
  value: string;
  label: string;
  subtitle?: string;
}

// ── Componente principal ─────────────────────────────────────────────────
export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedBrand, setSelectedBrand] = useState<VehicleBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<VehicleVersion | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  // Animação do card dica
  const tipAnim = useRef(new Animated.Value(0)).current;
  // Animação do modal sheet
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

  const openPicker = useCallback((mode: PickerMode) => {
    setPickerMode(mode);
    sheetAnim.setValue(0);
    Animated.spring(sheetAnim, {
      toValue: 1,
      tension: 70,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [sheetAnim]);

  const closePicker = useCallback(() => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setPickerMode(null));
  }, [sheetAnim]);

  const handleSelectBrand = useCallback((brand: VehicleBrand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedVersion(null);
    closePicker();
  }, [closePicker]);

  const handleSelectModel = useCallback((model: VehicleModel) => {
    setSelectedModel(model);
    setSelectedVersion(null);
    closePicker();
  }, [closePicker]);

  const handleSelectVersion = useCallback((version: VehicleVersion) => {
    setSelectedVersion(version);
    closePicker();
  }, [closePicker]);

  const handleContinue = useCallback(() => {
    if (!selectedBrand || !selectedModel || !selectedVersion) return;
    navigation?.navigate('Categories', {
      brand: selectedBrand.name,
      model: selectedModel.name,
      version: selectedVersion.name,
      year: selectedVersion.year,
    });
  }, [selectedBrand, selectedModel, selectedVersion, navigation]);

  const canContinue = !!selectedBrand && !!selectedModel && !!selectedVersion;

  // ── Picker options por modo ──────────────────────────────────────────
  const pickerOptions: PickerOption[] = React.useMemo(() => {
    if (pickerMode === 'brand') {
      return VEHICLE_BRANDS.map((b) => ({
        value: b.id,
        label: b.name,
        subtitle: `${b.modelCount} modelos`,
      }));
    }
    if (pickerMode === 'model' && selectedBrand) {
      return getModelsByBrand(selectedBrand.id).map((m) => ({
        value: m.id,
        label: m.name,
        subtitle: m.segment,
      }));
    }
    if (pickerMode === 'version' && selectedModel) {
      return getVersionsByModel(selectedModel.id).map((v) => ({
        value: v.id,
        label: v.name,
        subtitle: `${v.year} · ${v.engine}`,
      }));
    }
    return [];
  }, [pickerMode, selectedBrand, selectedModel]);

  const pickerTitle = pickerMode === 'brand'
    ? 'Selecione a marca'
    : pickerMode === 'model'
    ? 'Selecione o modelo'
    : 'Selecione a versão';

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {/* ── HEADER ───────────────────────────────────────────────────── */}
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

      {/* ── CORPO ────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Instrução */}
        <Text style={styles.instruction}>
          Informe o veículo que deseja pesquisar. A IA irá buscar dados em múltiplas fontes.
        </Text>

        {/* Progress steps */}
        <StepProgress
          steps={['Veículo', 'Categorias', 'Pesquisando', 'Resultado']}
          current={0}
        />

        {/* Campo: Marca */}
        <SelectField
          label="MARCA"
          placeholder="Selecione a marca"
          value={selectedBrand?.name}
          filled={!!selectedBrand}
          disabled={false}
          onPress={() => openPicker('brand')}
        />

        {/* Campo: Modelo */}
        <SelectField
          label="MODELO"
          placeholder={selectedBrand ? 'Selecione o modelo' : 'Selecione a marca primeiro'}
          value={selectedModel?.name}
          filled={!!selectedModel}
          disabled={!selectedBrand}
          onPress={() => selectedBrand && openPicker('model')}
        />

        {/* Campo: Versão */}
        <SelectField
          label="VERSÃO"
          placeholder={selectedModel ? 'Selecione a versão' : 'Selecione o modelo primeiro'}
          value={selectedVersion?.name}
          subValue={selectedVersion ? `${selectedVersion.year} · ${selectedVersion.engine}` : undefined}
          filled={!!selectedVersion}
          disabled={!selectedModel}
          onPress={() => selectedModel && openPicker('version')}
        />

        {/* Card dica */}
        <Animated.View
          style={[
            styles.tipCard,
            {
              opacity: tipAnim,
              transform: [
                {
                  translateY: tipAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.tipIcon}><FontAwesomeIcon icon={faLightbulb} style={{color: "rgb(255, 212, 59)",}} /></Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Dica</Text>
            <Text style={styles.tipText}>
              Selecione a versão mais próxima que deseja comparar com seus modelos.
            </Text>
          </View>
        </Animated.View>

        {/* Botão Continuar */}
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

      {/* ── BOTTOM SHEET PICKER ───────────────────────────────────────── */}
      <Modal
        visible={pickerMode !== null}
        transparent
        animationType="none"
        onRequestClose={closePicker}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closePicker}
        />
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: sheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [400, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{pickerTitle}</Text>

          <FlatList
            data={pickerOptions}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => {
              const isSelected =
                (pickerMode === 'brand' && selectedBrand?.id === item.value) ||
                (pickerMode === 'model' && selectedModel?.id === item.value) ||
                (pickerMode === 'version' && selectedVersion?.id === item.value);

              return (
                <TouchableOpacity
                  style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                  onPress={() => {
                    if (pickerMode === 'brand') {
                      const b = VEHICLE_BRANDS.find((x) => x.id === item.value);
                      if (b) handleSelectBrand(b);
                    } else if (pickerMode === 'model' && selectedBrand) {
                      const m = getModelsByBrand(selectedBrand.id).find((x) => x.id === item.value);
                      if (m) handleSelectModel(m);
                    } else if (pickerMode === 'version' && selectedModel) {
                      const v = getVersionsByModel(selectedModel.id).find((x) => x.id === item.value);
                      if (v) handleSelectVersion(v);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {item.label}
                    </Text>
                    {item.subtitle ? (
                      <Text style={[styles.optionSubtitle, isSelected && styles.optionSubtitleSelected]}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </View>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

// ── Sub-componentes ──────────────────────────────────────────────────────

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
  label, placeholder, value, subValue, filled, disabled, onPress,
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

// ── Step Progress ─────────────────────────────────────────────────────────
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
              <Text
                style={[progressStyles.dotNum, i === current && progressStyles.dotNumActive]}
              >
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