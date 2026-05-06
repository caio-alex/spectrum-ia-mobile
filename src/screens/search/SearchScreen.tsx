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
          <Text style={styles.tipIcon}>💡</Text>
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

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  field: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldFilled: {
    borderColor: theme.colors.secondary,
    backgroundColor: 'rgba(131,192,255,0.08)',
  },
  fieldDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.surface,
  },
  left: { flex: 1 },
  value: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.textMuted,
    fontWeight: '400',
    fontSize: 13,
  },
  subValue: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '500',
    marginTop: 1,
  },
  disabledText: { color: theme.colors.textMuted },
  chevron: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
});

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

const progressStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  item: { alignItems: 'center', gap: 4 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dotDone: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  dotCheck: { fontSize: 10, color: '#fff', fontWeight: '700' },
  dotNum: { fontSize: 9, color: theme.colors.textMuted, fontWeight: '700' },
  dotNumActive: { color: '#fff' },
  label: {
    fontSize: 8,
    color: theme.colors.textMuted,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelActive: { color: theme.colors.primary, fontWeight: '700' },
  labelDone: { color: theme.colors.success, fontWeight: '600' },
  line: {
    flex: 1,
    height: 1.5,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  lineDone: { backgroundColor: theme.colors.success },
});

// ── Styles principais ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },

  // Header
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 4,
    paddingBottom: 14,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 14,
    color: 'rgba(131,192,255,0.9)',
    fontWeight: '500',
  },
  backLabel: {
    fontSize: 11,
    color: 'rgba(131,192,255,0.9)',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },

  // Body
  body: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bodyContent: {
    padding: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  instruction: {
    fontSize: 12,
    color: theme.colors.textLight,
    lineHeight: 18,
    marginBottom: 18,
  },

  // Tip card
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(131,192,255,0.1)',
    borderWidth: 1.5,
    borderColor: theme.colors.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
    alignItems: 'flex-start',
  },
  tipIcon: { fontSize: 16, marginTop: 1 },
  tipContent: { flex: 1 },
  tipTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 11,
    color: theme.colors.primary,
    opacity: 0.8,
    lineHeight: 16,
  },

  // Continue button
  continueBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  continueBtnDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  continueBtnTextDisabled: {
    color: theme.colors.textMuted,
  },

  // Modal overlay
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Bottom sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  // Option items
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  optionItemSelected: {
    backgroundColor: 'rgba(0,24,129,0.07)',
  },
  optionLeft: { flex: 1 },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: 10,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  optionSubtitleSelected: {
    color: theme.colors.primary,
    opacity: 0.7,
  },
  checkMark: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '700',
    marginLeft: 8,
  },
});