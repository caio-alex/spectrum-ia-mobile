// src/mocks/vehicleData.ts

export interface VehicleBrand { id: string; name: string; modelCount: number; country: string; }
export interface VehicleModel { id: string; brandId: string; name: string; segment: string; }
export interface VehicleVersion { id: string; modelId: string; name: string; year: string; engine: string; transmission: string; }

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

// ── Marcas, Modelos e Versões ─────────────────────────────────────────────
export const VEHICLE_BRANDS: VehicleBrand[] = [
  { id: 'ford',   name: 'Ford',   modelCount: 5, country: 'EUA' },
  { id: 'toyota', name: 'Toyota', modelCount: 8, country: 'Japão' },
];

export const VEHICLE_MODELS: VehicleModel[] = [
  { id: 'ranger',        brandId: 'ford',   name: 'Ranger',        segment: 'Picape' },
  { id: 'corolla_cross', brandId: 'toyota', name: 'Corolla Cross', segment: 'SUV compacto' },
];

export const VEHICLE_VERSIONS: VehicleVersion[] = [
  { id: 'ranger_limited', modelId: 'ranger',        name: 'Limited 3.0 V6', year: '2026', engine: '3.0L V6', transmission: 'Aut 10v' },
  { id: 'cc_xre_24',      modelId: 'corolla_cross', name: 'XRE',            year: '2024', engine: '2.0 Flex',  transmission: 'CVT' },
];

export function getModelsByBrand(brandId: string): VehicleModel[] { return VEHICLE_MODELS.filter((m) => m.brandId === brandId); }
export function getVersionsByModel(modelId: string): VehicleVersion[] { return VEHICLE_VERSIONS.filter((v) => v.modelId === modelId); }

// ── Categorias ────────────────────────────────────────────────────────────
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

// ── Fontes ────────────────────────────────────────────────────────────────
export const SEARCH_SOURCES: SearchSource[] = [
  { id: 'official', name: 'Site oficial da montadora', icon: '🏭', maxFields: 12, type: 'official' },
  { id: 'reviews', name: 'Quatro Rodas / iCarros', icon: '📰', maxFields: 8, type: 'review' },
  { id: 'youtube', name: 'YouTube — Reviews', icon: '▶️', maxFields: 6, type: 'review' },
  { id: 'presskit', name: 'Press kits e PDFs', icon: '📄', maxFields: 4, type: 'estimated' },
];

// ── Respostas Completas do Back-end ───────────────────────────────────────
export const MOCK_VEHICLE_RESPONSES: Record<string, any> = {
  'ranger_limited': {
    "vehicle": { "brand": "Ford", "model": "Ranger", "trim": "Limited 3.0L V6", "year": 2026 },
    "specs": {
      "Motor e Transmissão": {
        "Potência": { "value": "250 cv", "source": "OFFICIAL" },
        "Torque": { "value": "61,2 kgfm", "source": "OFFICIAL" },
        "Cilindrada": { "value": "2993 cm³", "source": "OFFICIAL" },
        "Quantidade de marchas": { "value": "10 marchas", "source": "OFFICIAL" },
        "Motor Diesel": { "value": "Sim", "source": "OFFICIAL" },
        "Transmissão Automática": { "value": "Sim", "source": "OFFICIAL" },
        "Tecnologia turbo": { "value": "Sim", "source": "OFFICIAL" },
        "Paddle Shift": { "value": "Não", "source": "REVIEW" },
        "E-Shifter (Manopla eletrônica)": { "value": "Sim", "source": "OFFICIAL" },
        "Economia de Combustível": { "value": "8,9 km/l (Cidade) / 10,2 km/l (Estrada)", "source": "REVIEW" }
      },
      "Rodas": {
        "Aro (polegadas)": { "value": "20 polegadas", "source": "OFFICIAL" },
        "Rodas de Liga leve": { "value": "Sim", "source": "OFFICIAL" },
        "Pneus ATR (50/50)": { "value": "Não", "source": "REVIEW" },
        "Full Size Spare tires (same as vehicle base)": { "value": "Sim", "source": "OFFICIAL" },
        "Pneus RunFlat": { "value": "Não", "source": "ESTIMATED" }
      },
      "Conectividade": {
        "Wi-Fi Hotspot": { "value": "Sim", "source": "OFFICIAL" },
        "Digital assistant (Assistente Digital Inteligente)": { "value": "Sim (Sync 4)", "source": "OFFICIAL" },
        "Destravamento/Travamento das portas": { "value": "Sim (Via app FordPass)", "source": "OFFICIAL" },
        "Localização do Veículo": { "value": "Sim", "source": "OFFICIAL" },
        "Atualizaçãos OTA": { "value": "Sim", "source": "OFFICIAL" },
        "Online Traffic (Sync 4)": { "value": "Sim", "source": "OFFICIAL" }
      },
      "Entretenimento e Multimídia": {
        "Multimedia polegadas": { "value": "12 polegadas", "source": "OFFICIAL" },
        "Conexão Wireless Android Auto & Car Play": { "value": "Sim", "source": "OFFICIAL" },
        "Bluetooth": { "value": "Sim", "source": "OFFICIAL" },
        "Camera 360 graus": { "value": "Sim", "source": "OFFICIAL" },
        "Subwoofer + Amplificador": { "value": "Sim (Bang & Olufsen Premium)", "source": "REVIEW" },
        "USB (unidade)": { "value": "4 unidades", "source": "OFFICIAL" }
      },
      "Ar-condicionado": {
        "Ar Condicionado Automático e Digital": { "value": "Sim", "source": "OFFICIAL" },
        "Ar condicionado de duas zonas": { "value": "Sim", "source": "OFFICIAL" },
        "Ar Condicionado com saída p/ 2ª fileira ou mais de bancos": { "value": "Sim", "source": "OFFICIAL" }
      },
      "Segurança": {
        "Airbag (cada)": { "value": "7 Airbags", "source": "OFFICIAL" },
        "Sensor de Pressão dos pneus (TPMS)": { "value": "Sim", "source": "OFFICIAL" },
        "Sistema Anti Capotamento (Rollover Stability Control)": { "value": "Sim", "source": "OFFICIAL" },
        "Controle de descida": { "value": "Sim", "source": "OFFICIAL" },
        "Controle de reboque": { "value": "Sim", "source": "OFFICIAL" }
      },
      "Tecnologia Avançada": {
        "Piloto Automático Adaptativo + Stop & GO": { "value": "Sim", "source": "OFFICIAL" },
        "Sistema de Permanência na Faixa (alerta e assistência)": { "value": "Sim", "source": "OFFICIAL" },
        "AEB (Autonomous Emergency Brake)": { "value": "Sim", "source": "OFFICIAL" },
        "Sistema de monitoramento de ponto-cego (BLIS)": { "value": "Sim", "source": "OFFICIAL" },
        "Sistema de Estacionamento Automático - 2.0 (Supervisionado)": { "value": "Sim", "source": "REVIEW" }
      },
      "Travamento e Vidros": {
        "Trava Elétrica das portas": { "value": "Sim", "source": "OFFICIAL" },
        "Sistema de um toque para cima/baixo + Anti-esmagamento": { "value": "Sim (Todas as portas)", "source": "OFFICIAL" },
        "Sistema Keyless Entry com Botão de Partida (PEPS)": { "value": "Sim", "source": "OFFICIAL" },
        "Tampa do Porta-malas automatico": { "value": "Não se aplica", "source": "OFFICIAL" }
      },
      "Acabamento Interno": {
        "Bancos revestidos em couro": { "value": "Sim (Premium Preto)", "source": "OFFICIAL" },
        "Volante revestido em couro/vynil": { "value": "Sim", "source": "OFFICIAL" },
        "Painel Soft Touch": { "value": "Sim", "source": "REVIEW" }
      },
      "Teto Solar": {
        "Teto Solar Elétrico": { "value": "Não disponível", "source": "OFFICIAL" },
        "Teto Solar Panorâmico": { "value": "Não disponível", "source": "OFFICIAL" }
      },
      "Bancos": {
        "Banco posições Elétrico": { "value": "Sim (8 posições para motorista)", "source": "OFFICIAL" },
        "Banco Traseiro Bipartido (60/40)": { "value": "Sim", "source": "OFFICIAL" },
        "Bancos Aquecimento (Frontal)": { "value": "Não", "source": "ESTIMATED" }
      },
      "Iluminação": {
        "Faróis Full LED": { "value": "Sim (Matrix LED)", "source": "OFFICIAL" },
        "LED Day time running lights": { "value": "Sim", "source": "OFFICIAL" },
        "Farol alto automático": { "value": "Sim", "source": "OFFICIAL" },
        "Iluminação Ambiente Multi-Color": { "value": "Sim", "source": "REVIEW" }
      },
      "Tração 4x4 e Off-Road": {
        "Tração 4x4 (high/low)": { "value": "Sim (4x4 Avançada com modo Automático)", "source": "OFFICIAL" },
        "Diferencial traseiro blocante": { "value": "Sim (Eletrônico)", "source": "OFFICIAL" },
        "Terrain Management System": { "value": "Sim (6 modos de condução)", "source": "OFFICIAL" },
        "Protetor de Caçamba": { "value": "Sim", "source": "OFFICIAL" },
        "Peito de aço": { "value": "Sim (Protetor inferior reforçado)", "source": "OFFICIAL" }
      },
      "Outros": {
        "Anos de garantia": { "value": "5 anos sem limite de quilometragem", "source": "OFFICIAL" },
        "Engate de Reboque 3.500 kg": { "value": "Sim (Capacidade máxima de tração)", "source": "OFFICIAL" },
        "Tomada 110V (cada)": { "value": "Sim (Na caçamba e cabine)", "source": "OFFICIAL" }
      }
    }
  },
  'cc_xre_24': {
    "vehicle": { "brand": "Toyota", "model": "Corolla Cross", "trim": "XRE", "year": 2024 },
    "specs": {
      "Motor e Transmissão": {
        "Potência": { "value": "177 cv", "source": "OFFICIAL" },
        "Transmissão Automática": { "value": "CVT 10 Marchas", "source": "REVIEW" }
      },
      "Rodas": { "Aro (polegadas)": { "value": "18 polegadas", "source": "OFFICIAL" } },
      "Segurança": { "Airbag (cada)": { "value": "7 Airbags", "source": "OFFICIAL" } }
    }
  }
};