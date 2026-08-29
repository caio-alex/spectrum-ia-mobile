// src/screens/search/SearchScreen.tsx
//
// TELA 03 — SELEÇÃO DO VEÍCULO (passo 1 de 4)
//
// Três mudanças de usabilidade em relação à versão anterior:
//
//   • O botão "Continuar" saiu do fim da rolagem e virou uma barra fixa. Com
//     cinco campos, ele ficava fora da tela justamente quando ficava ativo.
//   • O seletor (marca / modelo / ano / versão) ganhou busca. A lista de marcas
//     passa de 40 itens; rolar até "Volkswagen" era o pedágio de toda pesquisa.
//   • O cabeçalho mostra em que passo o usuário está, e o veículo escolhido vai
//     se montando num cartão de conferência antes de avançar.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../styles/theme';
import { useBrands, useModels, useTrims } from '../../hooks/useVehicles';
import { SessionPickerSheet } from '../../components/SessionPickerSheet';
import { formatDate } from '../../utils/date';
import type { ModelInfo } from '../../types/api';
import type { SessionResponse } from '../../services/sessions';
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  PressableScale,
  Screen,
  ScreenHeader,
  SelectRow,
  Sheet,
  SkeletonList,
  Stepper,
  TextField,
  Txt,
} from '../../components/ui';

type PickerMode = 'brand' | 'model' | 'year' | 'trim' | null;

interface PickerOption {
  value: string;
  label: string;
  subtitle?: string;
}

/**
 * Params opcionais: chegam preenchidos quando a pesquisa parte da Home (com a
 * sessão já escolhida) ou de dentro de uma sessão. Vindo da aba "Pesquisa" da
 * bottom nav não há sessão ainda — por isso o campo é editável aqui também.
 */
interface RouteParams {
  sessionId?: string;
  sessionName?: string;
}

export const SearchScreen = ({ navigation, route }: any) => {
  const params: RouteParams | undefined = route?.params;
  const insets = useSafeAreaInsets();

  const [session, setSession] = useState<SessionResponse | null>(null);
  const [sessionPickerVisible, setSessionPickerVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelInfo | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTrim, setSelectedTrim] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [query, setQuery] = useState('');

  // Identidade da sessão ativa: o objeto completo quando escolhido no sheet,
  // senão o par id/nome recebido por navegação.
  const sessionId = session?.id ?? params?.sessionId ?? null;
  const sessionName = session?.name ?? params?.sessionName ?? null;

  const brandsQuery = useBrands();
  const modelsQuery = useModels(selectedBrand);
  const trimsQuery = useTrims(selectedBrand, selectedModel?.name ?? null, selectedYear);

  // A busca é por seletor: reabrir noutro campo não deve herdar o filtro antigo.
  useEffect(() => setQuery(''), [pickerMode]);

  const closePicker = useCallback(() => setPickerMode(null), []);

  const handleSelectBrand = useCallback((brand: string) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedYear(null);
    setSelectedTrim(null);
    setPickerMode(null);
  }, []);

  const handleSelectModel = useCallback((model: ModelInfo) => {
    setSelectedModel(model);
    setSelectedYear(null);
    setSelectedTrim(null);
    setPickerMode(null);
  }, []);

  const handleSelectYear = useCallback((year: number) => {
    setSelectedYear(year);
    setSelectedTrim(null);
    setPickerMode(null);
  }, []);

  const handleSelectTrim = useCallback((trim: string) => {
    setSelectedTrim(trim);
    setPickerMode(null);
  }, []);

  const handleSelectSession = useCallback((selected: SessionResponse) => {
    setSession(selected);
    setSessionPickerVisible(false);
  }, []);

  const canContinue =
    !!sessionId && !!selectedBrand && !!selectedModel && !!selectedYear && !!selectedTrim;

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    navigation?.navigate('Categories', {
      brand: selectedBrand,
      model: selectedModel!.name,
      trim: selectedTrim,
      year: selectedYear,
      sessionId,
      sessionName,
    });
  }, [
    canContinue,
    selectedBrand,
    selectedModel,
    selectedTrim,
    selectedYear,
    sessionId,
    sessionName,
    navigation,
  ]);

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

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pickerOptions;
    return pickerOptions.filter((o) => o.label.toLowerCase().includes(q));
  }, [pickerOptions, query]);

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

  // Busca só compensa em lista longa; abaixo disso é um campo a mais na tela.
  const searchable = pickerOptions.length > 8;

  const isSelectedOption = (value: string) =>
    (pickerMode === 'brand' && selectedBrand === value) ||
    (pickerMode === 'model' && selectedModel?.name === value) ||
    (pickerMode === 'year' && selectedYear === Number(value)) ||
    (pickerMode === 'trim' && selectedTrim === value);

  const pickOption = (value: string) => {
    if (pickerMode === 'brand') return handleSelectBrand(value);
    if (pickerMode === 'model') {
      const model = (modelsQuery.data ?? []).find((m) => m.name === value);
      if (model) handleSelectModel(model);
      return;
    }
    if (pickerMode === 'year') return handleSelectYear(Number(value));
    if (pickerMode === 'trim') return handleSelectTrim(value);
  };

  return (
    <Screen>
      <ScreenHeader
        onBack={() => navigation?.goBack()}
        eyebrow="Passo 1 de 4"
        title="Qual veículo?"
        subtitle="A IA vai buscar a ficha técnica em várias fontes ao mesmo tempo."
      >
        <Stepper
          onDark
          steps={['Veículo', 'Categorias', 'Pesquisa', 'Resultado']}
          current={0}
          style={{ marginTop: theme.space[5] }}
        />
      </ScreenHeader>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SelectRow
          label="Sessão"
          icon="sessions"
          placeholder="Selecione ou crie uma sessão"
          value={sessionName}
          subValue={session ? `Criada em ${formatDate(session.createdAt)}` : undefined}
          onPress={() => setSessionPickerVisible(true)}
        />

        <SelectRow
          label="Marca"
          icon="vehicle"
          placeholder="Selecione a marca"
          value={selectedBrand}
          loading={brandsQuery.isLoading}
          onPress={() => setPickerMode('brand')}
        />
        <SelectRow
          label="Modelo"
          icon="fields"
          placeholder={selectedBrand ? 'Selecione o modelo' : 'Escolha a marca primeiro'}
          value={selectedModel?.name}
          disabled={!selectedBrand}
          onPress={() => setPickerMode('model')}
        />
        <SelectRow
          label="Ano"
          icon="date"
          placeholder={selectedModel ? 'Selecione o ano' : 'Escolha o modelo primeiro'}
          value={selectedYear ? String(selectedYear) : undefined}
          disabled={!selectedModel}
          onPress={() => setPickerMode('year')}
        />
        <SelectRow
          label="Versão"
          icon="catEngine"
          placeholder={selectedYear ? 'Selecione a versão' : 'Escolha o ano primeiro'}
          value={selectedTrim}
          disabled={!selectedYear}
          onPress={() => setPickerMode('trim')}
        />

        {/* Cartão de conferência — aparece assim que dá para identificar o carro. */}
        {selectedBrand && selectedModel ? (
          <Card variant="brand" style={styles.preview}>
            <View style={styles.previewIcon}>
              <Icon name="vehicle" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="micro" tone="muted" uppercase style={{ letterSpacing: 1 }}>
                {selectedBrand}
              </Txt>
              <Txt variant="title3" numberOfLines={1}>
                {selectedModel.name}
                {selectedTrim ? ` ${selectedTrim}` : ''}
              </Txt>
              {selectedYear ? <Badge label={String(selectedYear)} tone="brand" size="sm" /> : null}
            </View>
          </Card>
        ) : (
          <Callout tone="tip" style={{ marginTop: theme.space[2] }}>
            Escolha a versão mais próxima da que você quer comparar com os seus modelos — é ela
            que define a ficha técnica que a IA vai buscar.
          </Callout>
        )}
      </ScrollView>

      {/* Barra de ação fixa: o próximo passo fica sempre ao alcance do polegar. */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + theme.space[3] }]}>
        <Button
          label={
            !sessionId
              ? 'Selecione uma sessão'
              : canContinue
                ? 'Continuar'
                : 'Complete os campos acima'
          }
          size="lg"
          icon={canContinue ? 'forward' : undefined}
          iconPosition="trailing"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </View>

      <Sheet
        visible={pickerMode !== null}
        onClose={closePicker}
        title={pickerTitle}
        avoidKeyboard={searchable}
        maxHeightRatio={0.82}
      >
        {searchable ? (
          <TextField
            icon="search"
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar…"
            autoCapitalize="none"
            autoCorrect={false}
            containerStyle={{ marginBottom: theme.space[3] }}
          />
        ) : null}

        {pickerLoading ? (
          <SkeletonList count={5} />
        ) : pickerError ? (
          <ErrorState description="Não foi possível carregar. Verifique sua conexão." />
        ) : filteredOptions.length === 0 ? (
          <EmptyState
            icon="search"
            title={query ? 'Nada encontrado' : 'Nenhum item disponível'}
            description={
              query ? `Nenhum resultado para "${query.trim()}".` : 'Tente outra combinação.'
            }
          />
        ) : (
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: theme.space[3], gap: theme.space[1] }}
            renderItem={({ item }) => {
              const selected = isSelectedOption(item.value);
              return (
                <PressableScale
                  onPress={() => pickOption(item.value)}
                  scaleTo={0.985}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <View style={{ flex: 1, gap: 1 }}>
                    <Txt variant={selected ? 'bodyStrong' : 'body'} numberOfLines={1}>
                      {item.label}
                    </Txt>
                    {item.subtitle ? (
                      <Txt variant="micro" tone="faint">
                        {item.subtitle}
                      </Txt>
                    ) : null}
                  </View>
                  {selected ? (
                    <View style={styles.check}>
                      <Icon name="check" size={10} color="#FFFFFF" />
                    </View>
                  ) : null}
                </PressableScale>
              );
            }}
          />
        )}
      </Sheet>

      <SessionPickerSheet
        visible={sessionPickerVisible}
        selectedId={sessionId}
        onClose={() => setSessionPickerVisible(false)}
        onSelect={handleSelectSession}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: {
    padding: theme.space[4],
    paddingTop: theme.space[5],
    paddingBottom: theme.space[6],
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    marginTop: theme.space[2],
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.md,
    backgroundColor: theme.brand[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: theme.space[4],
    paddingTop: theme.space[3],
    backgroundColor: theme.colors.card,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: theme.brand[50],
    borderColor: theme.brand[100],
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: theme.radii.full,
    backgroundColor: theme.brand[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
