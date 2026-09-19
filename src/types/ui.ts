// src/types/ui.ts
//
// Contratos de view — o que os componentes consomem, em contraste com
// `src/types/api.ts`, que descreve o que a API devolve.
//
// `RecentSearch` é o contrato do <SearchCard>, preenchido pelo adapter em
// useSearchCards (SearchSummary -> RecentSearch). Este arquivo era
// `src/mocks/homeData.ts` de volta à época em que a Home rodava com dados
// inventados; sobrou só o tipo, e ele nunca foi mock.
//
// Duas ausências propositais, para não serem reintroduzidas por engano:
//   - não há `sourceTag`: o adapter preenchia 'Oficial' para todos os itens,
//     anunciando uma procedência que o dado não tinha. Procedência real só
//     aparece na tela de resultado, campo a campo;
//   - não há métricas fixas de usuário: os totais da Home saem do
//     `totalElements` que a própria API devolve.

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
