import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { getSearchResult } from '../services/searches';
import { relativeTime } from '../utils/date';
import type { RecentSearch } from '../mocks/homeData';
import type { SearchSummary } from '../types/api';

/**
 * Conta recursivamente os campos folha do JSON de specs.
 * Ignora a chave `sources` — mesma lógica do backend (SearchProcessor#countLeafFields).
 */
export const countLeafFields = (node: unknown): number => {
  if (node == null) return 0;
  if (typeof node !== 'object') return 1;
  if (Array.isArray(node)) {
    return node.reduce<number>((sum, item) => sum + countLeafFields(item), 0);
  }
  let count = 0;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === 'sources') continue;
    count += countLeafFields(value);
  }
  return count;
};

const mapStatus = (status: SearchSummary['status']): RecentSearch['status'] => {
  if (status === 'COMPLETED') return 'completed';
  if (status === 'FAILED') return 'error';
  return 'in_progress';
};

const summaryToCard = (item: SearchSummary, totalFields: number): RecentSearch => ({
  id: item.searchId,
  brand: item.vehicle?.brand ?? '',
  model: item.vehicle?.model ?? '',
  version: item.vehicle?.trim ?? '',
  categories: [],
  totalFields,
  createdAt: item.completedAt ?? new Date().toISOString(),
  relativeTime: relativeTime(item.completedAt),
  status: mapStatus(item.status),
});

/**
 * Converte SearchSummary[] no contrato visual do SearchCard.
 *
 * SearchSummary não traz `specs`, então buscamos `/searches/{id}/result` de
 * cada pesquisa concluída só para contar os campos — staleTime longo + cache
 * do React Query mitigam o custo desses N requests (e os resultados são
 * reaproveitados pela ResultScreen).
 */
export function useSearchCards(summaries: SearchSummary[]): RecentSearch[] {
  const completedSummaries = useMemo(
    () => summaries.filter((s) => s.status === 'COMPLETED'),
    [summaries],
  );

  const resultQueries = useQueries({
    queries: completedSummaries.map((s) => ({
      queryKey: ['searches', 'result', s.searchId] as const,
      queryFn: () => getSearchResult(s.searchId),
      staleTime: 1000 * 60 * 60,
    })),
  });

  const fieldCountById = useMemo(() => {
    const map: Record<string, number> = {};
    resultQueries.forEach((query, index) => {
      const summary = completedSummaries[index];
      if (query.data?.specs && summary) {
        map[summary.searchId] = countLeafFields(query.data.specs);
      }
    });
    return map;
    // resultQueries é recriado a cada render — comparamos pelos data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSummaries, resultQueries.map((q) => q.data).join('|')]);

  return useMemo(
    () => summaries.map((s) => summaryToCard(s, fieldCountById[s.searchId] ?? 0)),
    [summaries, fieldCountById],
  );
}
