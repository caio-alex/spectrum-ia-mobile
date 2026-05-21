// src/mocks/homeData.ts
//
// Após a integração:
//   - MOCK_USER foi removido — o perfil vem agora do AuthContext (AuthResponse.user).
//   - MOCK_RECENT_SEARCHES foi removido — substituído por GET /v1/searches (paginado).
//   - MOCK_USER_STATS continua mockado porque o backend ainda não expõe /users/me/stats.
//
// O tipo `RecentSearch` é mantido como contrato visual do componente SearchCard,
// alimentado por um adapter no HomeScreen (SearchSummary -> RecentSearch).

export type SourceTag = 'Oficial' | 'Review' | 'Estimado';

export interface RecentSearch {
  id: string;
  brand: string;
  model: string;
  version: string;
  categories: string[];
  totalFields: number;
  sourceTag: SourceTag;
  createdAt: string;
  relativeTime: string;
  status: 'completed' | 'in_progress' | 'error';
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  company: string;
  avatarUrl?: string;
}

// Stats rápidas exibidos no header da HomeScreen.
// TODO: substituir por GET /v1/users/me/stats quando disponível.
export const MOCK_USER_STATS = {
  totalSearches: 12,
  totalFields: 247,
  comparisons: 3,
};
