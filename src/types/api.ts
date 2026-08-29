export type Role = 'ADMIN' | 'ANALYST' | 'VIEWER';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthenticatedUser;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
}

export interface BrandsResponse {
  brands: string[];
}

export interface ModelInfo {
  name: string;
  years: number[];
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export interface TrimsResponse {
  trims: string[];
}

export interface VehicleSummary {
  brand: string;
  model: string;
  trim: string | null;
  year: number | null;
}

export type SearchStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SearchRequest {
  brand: string;
  model: string;
  trim?: string | null;
  year?: number | null;
  categories: string[];
  sessionId?: string | null;
}

export interface SearchEnqueuedResponse {
  searchId: string;
  status: SearchStatus;
  estimatedSeconds: number;
}

export type SpecSource = 'OFFICIAL' | 'REVIEW' | 'ESTIMATED';

export interface SpecField {
  value: string;
  source: SpecSource;
}

export type SpecsByCategory = Record<string, Record<string, SpecField>>;

export interface SearchResultResponse {
  searchId: string;
  vehicle: VehicleSummary;
  status: SearchStatus;
  completedAt: string | null;
  specs: SpecsByCategory;
  overallConfidence: number | null;
  aiLatencyMs: number | null;
}

export interface SearchSummary {
  searchId: string;
  vehicle: VehicleSummary;
  status: SearchStatus;
  completedAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface SearchProgressEvent {
  searchId: string;
  phase: 'QUEUED' | 'PROCESSING' | 'SOURCE_PROGRESS' | 'COMPLETED' | 'FAILED';
  source: string | null;
  sourceStatus: 'consultando' | 'concluida' | 'falhou' | null;
  fieldsExtracted: number | null;
  progressPercent: number | null;
  message: string | null;
  timestamp: string;
  synthetic: boolean;
}

/** Formatos aceitos por GET /v1/searches/{id}/export e /v1/sessions/{id}/export. */
export type ExportFormat = 'pdf' | 'csv';

export interface ExportResponse {
  downloadUrl: string;
  expiresAt: string;
}

export interface ApiErrorPayload {
  status: number;
  code?: string;
  message?: string;
  timestamp?: string;
  path?: string;
  details?: Record<string, string>;
}
