import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSession,
  getSession,
  listSessions,
  type CreateSessionRequest,
  type ListSessionsParams,
  type SessionResponse,
} from '../services/sessions';

interface QueryOptions {
  enabled?: boolean;
}

/** GET /v1/sessions — já vem ordenado por data de criação (desc) pelo backend. */
export function useSessions(params: ListSessionsParams = {}, options: QueryOptions = {}) {
  return useQuery({
    queryKey: ['sessions', 'list', params],
    queryFn: () => listSessions(params),
    enabled: options.enabled ?? true,
  });
}

export function useSession(sessionId: string | null | undefined) {
  return useQuery({
    queryKey: ['sessions', 'detail', sessionId],
    queryFn: () => getSession(sessionId as string),
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSessionRequest) => createSession(payload),
    onSuccess: (session: SessionResponse) => {
      // Semeia o detalhe para que SessionDetailScreen abra sem loading, e
      // invalida as listagens para a nova sessão aparecer no histórico.
      queryClient.setQueryData(['sessions', 'detail', session.id], session);
      void queryClient.invalidateQueries({ queryKey: ['sessions', 'list'] });
    },
  });
}
