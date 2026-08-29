// src/components/SessionPickerSheet.tsx
//
// Bottom sheet que resolve as duas metades do requisito "toda busca pertence a
// uma sessão": escolher uma existente ou criar uma nova sem sair do fluxo.
// Usado na Home, na SearchScreen e na SessionsScreen.
//
// Endpoints: GET /v1/sessions (listagem) e POST /v1/sessions (criação).
// Tenant e usuário criador são resolvidos pelo backend a partir do JWT.

import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';
import { useCreateSession, useSessions } from '../hooks/useSessions';
import { extractApiErrorMessage } from '../services/errorHandler';
import { formatDate } from '../utils/date';
import type { SessionResponse } from '../services/sessions';
import {
  Button,
  EmptyState,
  ErrorState,
  FormError,
  Icon,
  PressableScale,
  Sheet,
  SkeletonList,
  TextField,
  Txt,
} from './ui';

// Espelham as constraints do CreateSessionRequest no backend.
const NAME_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 1000;

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
  const [mode, setMode] = useState<Mode>(startInCreateMode ? 'create' : 'list');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Só busca quando o sheet está aberto — evita request na montagem da Home.
  const sessionsQuery = useSessions({ page: 0, size: 50 }, { enabled: visible });
  const createSession = useCreateSession();

  useEffect(() => {
    if (!visible) return;
    setMode(startInCreateMode ? 'create' : 'list');
    setName('');
    setDescription('');
    setFormError(null);
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
  const isCreating = mode === 'create';

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      locked={createSession.isPending}
      avoidKeyboard={isCreating}
      // O formulário ocupa quase toda a altura disponível e cabe inteiro, sem
      // rolagem: são dois campos e um botão. O que sobrava antes era espaço
      // desperdiçado no topo, não conteúdo demais.
      maxHeightRatio={isCreating ? 0.95 : 0.8}
      title={isCreating ? 'Nova sessão' : 'Selecione a sessão'}
      // Em criação o subtítulo saía caro em altura e dizia o que os próprios
      // rótulos dos campos já dizem.
      subtitle={isCreating ? undefined : 'Toda pesquisa fica registrada dentro de uma sessão.'}
    >
      {isCreating ? (
        <View>
          {/* Voltar para a lista é navegação, não uma alternativa a "Criar
              sessão" — embaixo do botão principal ele competia com o CTA e
              parecia uma segunda ação do formulário. No topo, funciona como o
              caminho de volta que de fato é. */}
          {!startInCreateMode ? (
            <PressableScale
              onPress={() => setMode('list')}
              disabled={createSession.isPending}
              scaleTo={0.97}
              accessibilityRole="button"
              style={styles.backLink}
            >
              <Icon name="chevronLeft" size={10} color={theme.brand[600]} />
              <Txt variant="micro" tone="accent" style={{ fontFamily: theme.fonts.semibold }}>
                Escolher uma sessão existente
              </Txt>
            </PressableScale>
          ) : null}

          <TextField
            label="Nome da sessão"
            icon="sessions"
            value={name}
            onChangeText={setName}
            placeholder="Ex.: Análise SUV Compacto Q2 2026"
            maxLength={NAME_MAX_LENGTH}
            counter={`${name.length}/${NAME_MAX_LENGTH}`}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => canSubmit && handleCreate()}
            editable={!createSession.isPending}
            containerStyle={{ marginBottom: theme.space[3] }}
          />

          <TextField
            label="Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Contexto da análise, objetivo, concorrentes..."
            maxLength={DESCRIPTION_MAX_LENGTH}
            multiline
            multilineHeight={68}
            editable={!createSession.isPending}
            containerStyle={{ marginBottom: theme.space[4] }}
          />

          <FormError message={formError} />

          <Button
            label="Criar sessão"
            icon="add"
            onPress={handleCreate}
            disabled={!canSubmit}
            loading={createSession.isPending}
          />
          {startInCreateMode ? (
            <Button
              label="Cancelar"
              variant="ghost"
              onPress={onClose}
              disabled={createSession.isPending}
              style={{ marginTop: theme.space[2] }}
            />
          ) : null}
        </View>
      ) : (
        <View style={{ flexShrink: 1 }}>
          <PressableScale onPress={() => setMode('create')} scaleTo={0.98} style={styles.createRow}>
            <View style={styles.createIcon}>
              <Icon name="add" size={14} color={theme.brand[700]} />
            </View>
            <Txt variant="bodyStrong" tone="brand">
              Criar nova sessão
            </Txt>
          </PressableScale>

          {sessionsQuery.isLoading ? (
            <SkeletonList count={3} />
          ) : sessionsQuery.error ? (
            <ErrorState
              description={extractApiErrorMessage(sessionsQuery.error, {
                fallback: 'Não foi possível carregar as sessões.',
              })}
              onRetry={() => void sessionsQuery.refetch()}
            />
          ) : sessions.length === 0 ? (
            <EmptyState
              brandMark
              title="Nenhuma sessão ainda"
              description="Crie a primeira para organizar as pesquisas de uma mesma análise."
              actionLabel="Criar sessão"
              onAction={() => setMode('create')}
            />
          ) : (
            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: theme.space[2], gap: theme.space[2] }}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedId;
                return (
                  <PressableScale
                    onPress={() => onSelect(item)}
                    scaleTo={0.985}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[styles.item, isSelected && styles.itemSelected]}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt variant="bodyStrong" numberOfLines={1}>
                        {item.name}
                      </Txt>
                      <Txt variant="micro" tone="faint">
                        Criada em {formatDate(item.createdAt)}
                      </Txt>
                    </View>
                    {isSelected ? (
                      <View style={styles.check}>
                        <Icon name="check" size={10} color="#FFFFFF" />
                      </View>
                    ) : (
                      <Icon name="chevronRight" size={11} color={theme.ink[300]} />
                    )}
                  </PressableScale>
                );
              }}
            />
          )}
        </View>
      )}
    </Sheet>
  );
};

const styles = StyleSheet.create({
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingVertical: theme.space[1],
    paddingRight: theme.space[3],
    marginBottom: theme.space[3],
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[3],
    borderRadius: theme.radii.md,
    borderWidth: 1.5,
    borderColor: theme.brand[100],
    borderStyle: 'dashed',
    backgroundColor: theme.brand[50],
    marginBottom: theme.space[4],
  },
  createIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[3],
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.card,
  },
  itemSelected: {
    borderColor: theme.brand[300],
    backgroundColor: theme.brand[50],
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
