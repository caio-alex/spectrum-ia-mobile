// src/components/SessionPickerSheet.tsx
//
// Bottom sheet que resolve as duas metades do requisito "toda busca pertence a
// uma sessão": escolher uma sessão existente ou criar uma nova sem sair do
// fluxo. Usado na Home, na SearchScreen e na SessionsScreen.
//
// Endpoints: GET /v1/sessions (listagem) e POST /v1/sessions (criação).
// Tenant e usuário criador são resolvidos pelo backend a partir do JWT.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../styles/theme';
import { styles } from '../styles/sessionPickerSheet.styles';
import { useCreateSession, useSessions } from '../hooks/useSessions';
import { extractApiErrorMessage } from '../services/errorHandler';
import { formatDate } from '../utils/date';
import type { SessionResponse } from '../services/sessions';

// Espelham as constraints do CreateSessionRequest no backend.
const NAME_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 1000;

const SHEET_OFFSET = 500;

type Mode = 'list' | 'create';

interface Props {
  visible: boolean;
  /** Sessão atualmente escolhida — recebe o check na lista. */
  selectedId?: string | null;
  onClose: () => void;
  /** Chamado ao escolher uma sessão existente OU ao criar uma nova. */
  onSelect: (session: SessionResponse) => void;
  /** Abre direto no formulário de criação (ex.: botão "Nova sessão"). */
  startInCreateMode?: boolean;
}

export const SessionPickerSheet: React.FC<Props> = ({
  visible,
  selectedId,
  onClose,
  onSelect,
  startInCreateMode = false,
}) => {
  // `mounted` mantém o Modal na árvore enquanto a animação de saída roda.
  const [mounted, setMounted] = useState(visible);
  const [mode, setMode] = useState<Mode>(startInCreateMode ? 'create' : 'list');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const translateY = useRef(new Animated.Value(SHEET_OFFSET)).current;

  // Só busca quando o sheet está aberto — evita request na montagem da Home.
  const sessionsQuery = useSessions({ page: 0, size: 50 }, { enabled: visible });
  const createSession = useCreateSession();

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setMode(startInCreateMode ? 'create' : 'list');
      setName('');
      setDescription('');
      setFormError(null);
      translateY.setValue(SHEET_OFFSET);
      Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true }).start();
    } else if (mounted) {
      Animated.timing(translateY, {
        toValue: SHEET_OFFSET,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, startInCreateMode]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && !createSession.isPending;

  const handleCreate = useCallback(() => {
    if (!trimmedName) {
      setFormError('Informe um nome para a sessão.');
      return;
    }
    if (trimmedName.length > NAME_MAX_LENGTH) {
      setFormError(`O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`);
      return;
    }
    setFormError(null);

    createSession.mutate(
      { name: trimmedName, description: description.trim() || undefined },
      {
        onSuccess: (session) => onSelect(session),
        onError: (err) =>
          setFormError(
            extractApiErrorMessage(err, {
              fallback: 'Não foi possível criar a sessão. Tente novamente.',
              byStatus: { 403: 'Seu perfil não permite criar sessões.' },
            }),
          ),
      },
    );
  }, [trimmedName, description, createSession, onSelect]);

  const sessions = sessionsQuery.data?.content ?? [];

  const renderList = () => (
    <>
      <Text style={styles.title}>Selecione a sessão</Text>
      <Text style={styles.subtitle}>Toda pesquisa fica registrada dentro de uma sessão.</Text>

      <TouchableOpacity
        style={styles.createRow}
        onPress={() => {
          setFormError(null);
          setMode('create');
        }}
        activeOpacity={0.75}
      >
        <Text style={styles.createRowPlus}>+</Text>
        <Text style={styles.createRowLabel}>Criar nova sessão</Text>
      </TouchableOpacity>

      {sessionsQuery.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : sessionsQuery.error ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateError}>
            {extractApiErrorMessage(sessionsQuery.error, {
              fallback: 'Não foi possível carregar as sessões.',
            })}
          </Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>
            Nenhuma sessão ainda. Crie a primeira para começar a pesquisar.
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 8 }}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedId;
            return (
              <TouchableOpacity
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                  <Text
                    style={[styles.itemName, isSelected && styles.itemNameSelected]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.itemMeta, isSelected && styles.itemMetaSelected]}>
                    Criada em {formatDate(item.createdAt)}
                  </Text>
                </View>
                {isSelected && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </>
  );

  const renderCreateForm = () => (
    <>
      <Text style={styles.title}>Nova sessão</Text>
      <Text style={styles.subtitle}>
        Dê um nome que identifique a análise — você poderá adicionar veículos logo em seguida.
      </Text>

      <View style={styles.fieldWrap}>
        <Text style={styles.inputLabel}>Nome da sessão</Text>
        <TextInput
          style={[styles.input, !!trimmedName && styles.inputFilled]}
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Análise SUV Compacto Q2 2026"
          placeholderTextColor={theme.colors.textMuted}
          maxLength={NAME_MAX_LENGTH}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => canSubmit && handleCreate()}
          editable={!createSession.isPending}
        />
        <Text style={styles.counter}>
          {name.length}/{NAME_MAX_LENGTH}
        </Text>
      </View>

      <View style={styles.fieldWrap}>
        <Text style={styles.inputLabel}>Descrição (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Contexto da análise, objetivo, concorrentes..."
          placeholderTextColor={theme.colors.textMuted}
          maxLength={DESCRIPTION_MAX_LENGTH}
          multiline
          editable={!createSession.isPending}
        />
      </View>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
        onPress={handleCreate}
        disabled={!canSubmit}
        activeOpacity={0.85}
      >
        {createSession.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.primaryBtnText, !canSubmit && styles.primaryBtnTextDisabled]}>
            Criar sessão
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => (startInCreateMode ? onClose() : setMode('list'))}
        disabled={createSession.isPending}
        activeOpacity={0.7}
      >
        <Text style={styles.secondaryBtnText}>
          {startInCreateMode ? 'Cancelar' : '← Escolher uma sessão existente'}
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
            <View style={styles.handle} />
            {mode === 'create' ? renderCreateForm() : renderList()}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
