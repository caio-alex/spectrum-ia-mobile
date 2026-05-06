// src/mocks/homeData.ts
// Dados mockados para a HomeScreen enquanto o back-end não está pronto.
// Substitua as chamadas por hooks reais (ex: useQuery) quando os endpoints estiverem disponíveis.
// Contrato de API esperado: GET /api/v1/searches?userId=:id&limit=10

export type SourceTag = 'Oficial' | 'Review' | 'Estimado';

export interface RecentSearch {
  id: string;
  brand: string;
  model: string;
  version: string;
  categories: string[];
  totalFields: number;
  sourceTag: SourceTag;
  createdAt: string; // ISO 8601
  relativeTime: string; // exibição humana — será gerado dinamicamente na integração real
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

// ── MOCK: Perfil do usuário logado ─────────────────────────────────────────
// Endpoint futuro: GET /api/v1/users/me
export const MOCK_USER: UserProfile = {
  id: 'usr_001',
  name: 'Ana Silva',
  initials: 'A',
  email: 'ana.silva@ford.com.br',
  company: 'Ford Brasil',
};

// ── MOCK: Pesquisas recentes ──────────────────────────────────────────────
// Endpoint futuro: GET /api/v1/searches?userId=usr_001&limit=10
export const MOCK_RECENT_SEARCHES: RecentSearch[] = [
  {
    id: 'srch_001',
    brand: 'Toyota',
    model: 'Corolla Cross',
    version: 'XRE',
    categories: ['Motor', 'Segurança', 'Conectividade'],
    totalFields: 24,
    sourceTag: 'Oficial',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relativeTime: 'há 2 horas',
    status: 'completed',
  },
  {
    id: 'srch_002',
    brand: 'Hyundai',
    model: 'Creta',
    version: 'N Line',
    categories: ['Motor', 'Dimensões', 'Conforto'],
    totalFields: 18,
    sourceTag: 'Review',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    relativeTime: 'ontem, 16h30',
    status: 'completed',
  },
  {
    id: 'srch_003',
    brand: 'Volkswagen',
    model: 'Taos',
    version: 'Highline',
    categories: ['Motor', 'Dimensões', 'Segurança'],
    totalFields: 21,
    sourceTag: 'Oficial',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    relativeTime: 'ontem, 10h15',
    status: 'completed',
  },
  {
    id: 'srch_004',
    brand: 'Jeep',
    model: 'Compass',
    version: 'Limited',
    categories: ['Motor', 'Conforto'],
    totalFields: 15,
    sourceTag: 'Estimado',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    relativeTime: 'há 3 dias',
    status: 'in_progress',
  },
];

// ── MOCK: Estatísticas rápidas do usuário ─────────────────────────────────
// Endpoint futuro: GET /api/v1/users/me/stats
export const MOCK_USER_STATS = {
  totalSearches: 12,
  totalFields: 247,
  comparisons: 3,
};