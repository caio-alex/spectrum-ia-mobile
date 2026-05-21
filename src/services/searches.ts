import { api } from './api';
import type {
  PageResponse,
  SearchEnqueuedResponse,
  SearchRequest,
  SearchResultResponse,
  SearchSummary,
} from '../types/api';

export async function createSearch(payload: SearchRequest): Promise<SearchEnqueuedResponse> {
  const { data } = await api.post<SearchEnqueuedResponse>('/searches', payload);
  return data;
}

export async function getSearchResult(searchId: string): Promise<SearchResultResponse> {
  const { data } = await api.get<SearchResultResponse>(`/searches/${searchId}/result`);
  return data;
}

export interface ListSearchesParams {
  sessionId?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export async function listSearches(
  params: ListSearchesParams = {},
): Promise<PageResponse<SearchSummary>> {
  const { data } = await api.get<PageResponse<SearchSummary>>('/searches', { params });
  return data;
}

export interface ExportResponse {
  downloadUrl: string;
  expiresAt: string;
}

export async function getExportUrl(searchId: string): Promise<ExportResponse> {
  const { data } = await api.get<ExportResponse>(`/searches/${searchId}/export`);
  return data;
}
