// src/mocks/vehicleData.ts
//
// Os mocks de marcas / modelos / versões / MOCK_VEHICLE_RESPONSES /
// MOCK_RESULT_SOURCES foram removidos após a integração com a API real
// (GET /v1/vehicles/{brands,models,trims}, GET /v1/searches/{id}/result —
// que já entrega o campo `sources` real dentro do JSON de specs).
//
// Continuam aqui os catálogos fixos que ainda não têm endpoint no backend:
//   - SEARCH_CATEGORIES: 14 categorias de pesquisa exibidas na CategoriesScreen.
//     `backendKey` precisa bater 1:1 com o que o backend aceita em SearchRequest.categories.
//   - SEARCH_SOURCES: catálogo visual ainda usado pela ProcessingScreen.
//   - CATEGORY_ICONS: mapeamento de emoji por categoria.

export interface SearchCategory {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  estimatedFields: number;
  backendKey: string;
}

export interface SearchSource {
  id: string;
  name: string;
  icon: string;
  maxFields: number;
  type: 'official' | 'review' | 'estimated';
}

export const SEARCH_CATEGORIES: SearchCategory[] = [
  { id: 'cat_1', name: 'Motor e Transmissão', backendKey: 'Motor e Transmissão', emoji: '⚙️', subtitle: 'Potência, torque e câmbio', estimatedFields: 19 },
  { id: 'cat_2', name: 'Rodas', backendKey: 'Rodas', emoji: '🛞', subtitle: 'Aro, pneus ATR, RunFlat', estimatedFields: 8 },
  { id: 'cat_3', name: 'Conectividade', backendKey: 'Conectividade', emoji: '📶', subtitle: 'FordPass, Wi-Fi, OTA', estimatedFields: 32 },
  { id: 'cat_4', name: 'Entretenimento e Multimídia', backendKey: 'Entretenimento e Multimídia', emoji: '📺', subtitle: 'Sync 4, som Premium', estimatedFields: 22 },
  { id: 'cat_5', name: 'Ar-condicionado', backendKey: 'Ar-condicionado', emoji: '❄️', subtitle: 'Dual zone e saídas', estimatedFields: 3 },
  { id: 'cat_6', name: 'Segurança', backendKey: 'Segurança', emoji: '🛡️', subtitle: 'Airbags, TPMS, controles', estimatedFields: 14 },
  { id: 'cat_7', name: 'Tecnologia Avançada', backendKey: 'Tecnologia Avançada', emoji: '🚀', subtitle: 'Piloto adaptativo, AEB', estimatedFields: 28 },
  { id: 'cat_8', name: 'Travamento e Vidros', backendKey: 'Travamento e Vidros', emoji: '🔒', subtitle: 'Alarme volumétrico', estimatedFields: 12 },
  { id: 'cat_9', name: 'Acabamento Interno', backendKey: 'Acabamento Interno', emoji: '🧵', subtitle: 'Revestimento em couro', estimatedFields: 7 },
  { id: 'cat_10', name: 'Teto Solar', backendKey: 'Teto Solar', emoji: '☀️', subtitle: 'Teto panorâmico', estimatedFields: 3 },
  { id: 'cat_11', name: 'Bancos', backendKey: 'Bancos', emoji: '💺', subtitle: 'Ajustes elétricos', estimatedFields: 12 },
  { id: 'cat_12', name: 'Iluminação', backendKey: 'Iluminação', emoji: '💡', subtitle: 'Faróis Full LED Matrix', estimatedFields: 17 },
  { id: 'cat_13', name: 'Tração 4x4 e Off-Road', backendKey: 'Tração 4x4 e Off-Road', emoji: '⛰️', subtitle: 'Bloqueio de diferencial', estimatedFields: 15 },
  { id: 'cat_14', name: 'Outros', backendKey: 'Outros', emoji: '📦', subtitle: 'Garantia e tomadas', estimatedFields: 45 },
];

export const CATEGORY_ICONS: Record<string, string> = {
  'motor e transmissao': '⚙️', 'rodas': '🛞', 'conectividade': '📶', 'entretenimento e multimidia': '📺',
  'ar-condicionado': '❄️', 'seguranca': '🛡️', 'tecnologia avancada': '🚀', 'travamento e vidros': '🔒',
  'acabamento interno': '🧵', 'teto solar': '☀️', 'bancos': '💺', 'iluminacao': '💡',
  'tracao 4x4 e off-road': '⛰️', 'outros': '📦',
};

export const SEARCH_SOURCES: SearchSource[] = [
  { id: 'official', name: 'Site oficial da montadora', icon: '🏭', maxFields: 12, type: 'official' },
  { id: 'reviews', name: 'Quatro Rodas / iCarros', icon: '📰', maxFields: 8, type: 'review' },
  { id: 'youtube', name: 'YouTube — Reviews', icon: '▶️', maxFields: 6, type: 'review' },
  { id: 'presskit', name: 'Press kits e PDFs', icon: '📄', maxFields: 4, type: 'estimated' },
];

