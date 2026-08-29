// src/mocks/homeData.ts
//
// O que sobrou aqui depois da integração com a API:
//
//   - MOCK_USER            → removido; o perfil vem do AuthContext.
//   - MOCK_RECENT_SEARCHES → removido; substituído por GET /v1/searches.
//   - MOCK_USER_STATS      → removido; as métricas da Home agora saem dos
//                            totais que a própria API devolve (totalElements
//                            das pesquisas e das sessões + soma dos campos).
//                            Números fixos na primeira tela do app corroem a
//                            confiança em tudo que vem depois.
//   - RecentSearch.sourceTag → removido; o adapter o preenchia como 'Oficial'
//                            para todos os itens, o que exibia uma garantia de
//                            procedência que o dado não tinha. Procedência real
//                            só aparece na tela de resultado, campo a campo.
//
// O tipo `RecentSearch` permanece como contrato visual do <SearchCard>,
// alimentado por um adapter em useSearchCards (SearchSummary -> RecentSearch).

export interface RecentSearch {
  id: string;
  brand: string;
  model: string;
  version: string;
  categories: string[];
  totalFields: number;
  createdAt: string;
  relativeTime: string;
  status: 'completed' | 'in_progress' | 'error';
}
