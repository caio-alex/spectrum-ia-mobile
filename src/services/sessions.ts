import { api } from './api';
import type { PageResponse } from '../types/api';

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
