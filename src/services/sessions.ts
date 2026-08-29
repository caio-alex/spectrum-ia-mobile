import { api } from './api';
import type { ExportFormat, ExportResponse, PageResponse } from '../types/api';

export interface SessionResponse {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  name: string;
  description?: string;
}

export async function createSession(payload: CreateSessionRequest): Promise<SessionResponse> {
  const { data } = await api.post<SessionResponse>('/sessions', payload);
  return data;
}

export async function getSession(id: string): Promise<SessionResponse> {
  const { data } = await api.get<SessionResponse>(`/sessions/${id}`);
  return data;
}

export interface ListSessionsParams {
  page?: number;
  size?: number;
  sort?: string;
}

export async function listSessions(
  params: ListSessionsParams = {},
): Promise<PageResponse<SessionResponse>> {
  const { data } = await api.get<PageResponse<SessionResponse>>('/sessions', { params });
  return data;
}

/**
 * GET /v1/sessions/{id}/export — junta as fichas técnicas de todas as pesquisas
 * concluídas da sessão em um único arquivo (o backend deduplica o mesmo veículo,
 * mantendo a pesquisa mais recente) e devolve uma URL de download temporária.
 */
export async function getSessionExportUrl(
  sessionId: string,
  format: ExportFormat = 'csv',
): Promise<ExportResponse> {
  const { data } = await api.get<ExportResponse>(`/sessions/${sessionId}/export`, {
    params: { format },
  });
  return data;
}
