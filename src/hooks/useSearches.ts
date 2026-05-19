import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createSearch,
  getSearchResult,
  listSearches,
  ListSearchesParams,
} from '../services/searches';
import type { SearchRequest } from '../types/api';

export function useCreateSearch() {
  return useMutation({
    mutationFn: (payload: SearchRequest) => createSearch(payload),
  });
}

export function useSearchResult(searchId: string | null | undefined) {
  return useQuery({
    queryKey: ['searches', 'result', searchId],
    queryFn: () => getSearchResult(searchId as string),
    enabled: !!searchId,
  });
}

export function useRecentSearches(params: ListSearchesParams = {}) {
  return useQuery({
    queryKey: ['searches', 'list', params],
    queryFn: () => listSearches(params),
  });
}
