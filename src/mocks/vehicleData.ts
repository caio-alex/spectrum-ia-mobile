// src/mocks/vehicleData.ts
//
// Dados mockados para as telas de Pesquisa, Categorias e Processamento.
// Endpoints futuros:
//   GET /api/v1/vehicles/brands
//   GET /api/v1/vehicles/brands/:brandId/models
//   GET /api/v1/vehicles/models/:modelId/versions

// ── Tipos ─────────────────────────────────────────────────────────────────
export interface VehicleBrand {
  id: string;
  name: string;
  modelCount: number;
  country: string;
}

export interface VehicleModel {
  id: string;
  brandId: string;
  name: string;
  segment: string;
}

export interface VehicleVersion {
  id: string;
  modelId: string;
  name: string;
  year: string;
  engine: string;
  transmission: string;
}

export interface SearchCategory {
  id: string;
  name: string;
  emoji: string;
  subtitle: string;
  estimatedFields: number;
  // Chave que mapeia para o objeto de specs recebido do back-end (ex: "Motor e Transmissão")
  backendKey: string;
}

export interface SearchSource {
  id: string;
  name: string;
  icon: string;
  maxFields: number;
  type: 'official' | 'review' | 'estimated';
}

// ── Marcas ────────────────────────────────────────────────────────────────
export const VEHICLE_BRANDS: VehicleBrand[] = [
  { id: 'toyota',     name: 'Toyota',        modelCount: 8,  country: 'Japão'    },
  { id: 'hyundai',    name: 'Hyundai',        modelCount: 7,  country: 'Coreia'   },
  { id: 'volkswagen', name: 'Volkswagen',     modelCount: 9,  country: 'Alemanha' },
  { id: 'jeep',       name: 'Jeep',           modelCount: 6,  country: 'EUA'      },
  { id: 'chevrolet',  name: 'Chevrolet',      modelCount: 7,  country: 'EUA'      },
  { id: 'honda',      name: 'Honda',          modelCount: 5,  country: 'Japão'    },
  { id: 'ford',       name: 'Ford',           modelCount: 5,  country: 'EUA'      },
  { id: 'nissan',     name: 'Nissan',         modelCount: 5,  country: 'Japão'    },
  { id: 'fiat',       name: 'Fiat',           modelCount: 6,  country: 'Itália'   },
  { id: 'renault',    name: 'Renault',        modelCount: 5,  country: 'França'   },
  { id: 'mitsubishi', name: 'Mitsubishi',     modelCount: 4,  country: 'Japão'    },
  { id: 'kia',        name: 'Kia',            modelCount: 6,  country: 'Coreia'   },
  { id: 'bmw',        name: 'BMW',            modelCount: 8,  country: 'Alemanha' },
  { id: 'mercedes',   name: 'Mercedes-Benz',  modelCount: 9,  country: 'Alemanha' },
];

// ── Modelos por marca ────────────────────────────────────────────────────
const VEHICLE_MODELS: VehicleModel[] = [
  // Toyota
  { id: 'corolla_cross',  brandId: 'toyota',     name: 'Corolla Cross',  segment: 'SUV compacto'    },
  { id: 'corolla',        brandId: 'toyota',     name: 'Corolla',        segment: 'Sedan médio'     },
  { id: 'yaris',          brandId: 'toyota',     name: 'Yaris',          segment: 'Hatch compacto'  },
  { id: 'rav4',           brandId: 'toyota',     name: 'RAV4',           segment: 'SUV médio'       },
  { id: 'hilux',          brandId: 'toyota',     name: 'Hilux',          segment: 'Picape'          },
  { id: 'sw4',            brandId: 'toyota',     name: 'SW4',            segment: 'SUV grande'      },
  { id: 'camry',          brandId: 'toyota',     name: 'Camry',          segment: 'Sedan grande'    },
  { id: 'prius',          brandId: 'toyota',     name: 'Prius',          segment: 'Sedan híbrido'   },
  // Hyundai
  { id: 'creta',          brandId: 'hyundai',    name: 'Creta',          segment: 'SUV compacto'    },
  { id: 'tucson',         brandId: 'hyundai',    name: 'Tucson',         segment: 'SUV médio'       },
  { id: 'hb20',           brandId: 'hyundai',    name: 'HB20',           segment: 'Hatch compacto'  },
  { id: 'ix35',           brandId: 'hyundai',    name: 'ix35',           segment: 'SUV compacto'    },
  { id: 'santa_fe',       brandId: 'hyundai',    name: 'Santa Fé',       segment: 'SUV grande'      },
  // Volkswagen
  { id: 'taos',           brandId: 'volkswagen', name: 'Taos',           segment: 'SUV compacto'    },
  { id: 'polo',           brandId: 'volkswagen', name: 'Polo',           segment: 'Hatch compacto'  },
  { id: 'virtus',         brandId: 'volkswagen', name: 'Virtus',         segment: 'Sedan compacto'  },
  { id: 'tcross',         brandId: 'volkswagen', name: 'T-Cross',        segment: 'SUV subcompacto' },
  { id: 'tiguan',         brandId: 'volkswagen', name: 'Tiguan',         segment: 'SUV médio'       },
  // Jeep
  { id: 'compass',        brandId: 'jeep',       name: 'Compass',        segment: 'SUV médio'       },
  { id: 'renegade',       brandId: 'jeep',       name: 'Renegade',       segment: 'SUV compacto'    },
  { id: 'commander',      brandId: 'jeep',       name: 'Commander',      segment: 'SUV grande'      },
  // Chevrolet
  { id: 'onix',           brandId: 'chevrolet',  name: 'Onix',           segment: 'Hatch compacto'  },
  { id: 'tracker',        brandId: 'chevrolet',  name: 'Tracker',        segment: 'SUV compacto'    },
  { id: 'spin',           brandId: 'chevrolet',  name: 'Spin',           segment: 'Minivan'         },
  // Honda
  { id: 'hr_v',           brandId: 'honda',      name: 'HR-V',           segment: 'SUV compacto'    },
  { id: 'civic',          brandId: 'honda',      name: 'Civic',          segment: 'Sedan médio'     },
  { id: 'city',           brandId: 'honda',      name: 'City',           segment: 'Sedan compacto'  },
];

// ── Versões por modelo ────────────────────────────────────────────────────
const VEHICLE_VERSIONS: VehicleVersion[] = [
  // Corolla Cross
  { id: 'cc_xre_24',     modelId: 'corolla_cross', name: 'XRE',         year: '2024', engine: '2.0 Flex Híbrido', transmission: 'CVT'    },
  { id: 'cc_xei_24',     modelId: 'corolla_cross', name: 'XEi',         year: '2024', engine: '1.8 Flex',         transmission: 'CVT'    },
  { id: 'cc_xls_24',     modelId: 'corolla_cross', name: 'XLS',         year: '2024', engine: '2.0 Flex Híbrido', transmission: 'CVT'    },
  { id: 'cc_gls_23',     modelId: 'corolla_cross', name: 'GLS',         year: '2023', engine: '2.0 Flex',         transmission: 'CVT'    },
  // Creta
  { id: 'cr_nline_24',   modelId: 'creta',         name: 'N Line',      year: '2024', engine: '1.0 Turbo GDi',    transmission: 'DCT 7v' },
  { id: 'cr_limited_24', modelId: 'creta',         name: 'Limited',     year: '2024', engine: '2.0 MPi',          transmission: 'Aut 6v' },
  { id: 'cr_action_24',  modelId: 'creta',         name: 'Action',      year: '2024', engine: '1.0 Turbo GDi',    transmission: 'Manual' },
  { id: 'cr_smart_23',   modelId: 'creta',         name: 'Smart',       year: '2023', engine: '2.0 MPi',          transmission: 'Aut 6v' },
  // Taos
  { id: 'ts_high_24',    modelId: 'taos',          name: 'Highline',    year: '2024', engine: '1.4 Turbo 150cv',  transmission: 'DSG 7v' },
  { id: 'ts_comf_24',    modelId: 'taos',          name: 'Comfortline', year: '2024', engine: '1.4 Turbo 150cv',  transmission: 'DSG 7v' },
  { id: 'ts_trend_24',   modelId: 'taos',          name: 'Trendline',   year: '2024', engine: '1.4 Turbo 125cv',  transmission: 'Manual' },
  // Compass
  { id: 'cp_limited_24', modelId: 'compass',       name: 'Limited',     year: '2024', engine: '1.3 Turbo 185cv',  transmission: 'Aut 9v' },
  { id: 'cp_series_24',  modelId: 'compass',       name: 'S',           year: '2024', engine: '1.3 Turbo 185cv',  transmission: 'Aut 9v' },
  { id: 'cp_long_24',    modelId: 'compass',       name: 'Longitude',   year: '2024', engine: '1.3 Turbo 150cv',  transmission: 'Aut 6v' },
  // HR-V
  { id: 'hrv_advance',   modelId: 'hr_v',          name: 'Advance',     year: '2024', engine: '1.5 Turbo 177cv',  transmission: 'CVT'    },
  { id: 'hrv_touring',   modelId: 'hr_v',          name: 'Touring',     year: '2024', engine: '1.5 Turbo 177cv',  transmission: 'CVT'    },
  // Tracker
  { id: 'tr_premier',    modelId: 'tracker',       name: 'Premier',     year: '2024', engine: '1.2 Turbo 133cv',  transmission: 'CVT'    },
  { id: 'tr_redline',    modelId: 'tracker',       name: 'Redline',     year: '2024', engine: '1.2 Turbo 133cv',  transmission: 'CVT'    },
];

// ── Helpers ────────────────────────────────────────────────────────────────
export function getModelsByBrand(brandId: string): VehicleModel[] {
  return VEHICLE_MODELS.filter((m) => m.brandId === brandId);
}

export function getVersionsByModel(modelId: string): VehicleVersion[] {
  return VEHICLE_VERSIONS.filter((v) => v.modelId === modelId);
}

// ── Categorias de pesquisa ────────────────────────────────────────────────
// As categorias refletem exatamente as chaves de primeiro nível retornadas
// pelo back-end no campo "specs" do resultado de análise.
// Exemplo de resposta: { "specs": { "Motor e Transmissão": {...}, "Rodas": {...} } }
export const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    id: 'motor_transmissao',
    name: 'Motor e Transmissão',
    emoji: '⚙️',
    subtitle: 'Potência, torque, câmbio, combustível',
    estimatedFields: 10,
    backendKey: 'Motor e Transmissão',
  },
  {
    id: 'rodas',
    name: 'Rodas',
    emoji: '🔘',
    subtitle: 'Aro, pneus, estepe, liga leve',
    estimatedFields: 6,
    backendKey: 'Rodas',
  },
  {
    id: 'conectividade',
    name: 'Conectividade',
    emoji: '📡',
    subtitle: 'Wi-Fi, OTA, ignição remota, app',
    estimatedFields: 8,
    backendKey: 'Conectividade',
  },
  {
    id: 'entretenimento_multimidia',
    name: 'Entretenimento e Multimídia',
    emoji: '🎵',
    subtitle: 'Tela, GPS, câmeras, USB, Bluetooth',
    estimatedFields: 7,
    backendKey: 'Entretenimento e Multimídia',
  },
  {
    id: 'ar_condicionado',
    name: 'Ar-condicionado',
    emoji: '❄️',
    subtitle: 'Automático, dual zone, saídas traseiras',
    estimatedFields: 3,
    backendKey: 'Ar-condicionado',
  },
  {
    id: 'seguranca',
    name: 'Segurança',
    emoji: '🛡️',
    subtitle: 'Airbags, ABS, assistências, ADAS',
    estimatedFields: 9,
    backendKey: 'Segurança',
  },
  {
    id: 'tecnologia_avancada',
    name: 'Tecnologia Avançada',
    emoji: '🤖',
    subtitle: 'Piloto automático, sensores, HUD',
    estimatedFields: 6,
    backendKey: 'Tecnologia Avançada',
  },
  {
    id: 'travamento_vidros',
    name: 'Travamento e Vidros',
    emoji: '🔒',
    subtitle: 'Travas elétricas, vidros, retrovisores',
    estimatedFields: 5,
    backendKey: 'Travamento e Vidros',
  },
  {
    id: 'acabamento_interno',
    name: 'Acabamento Interno',
    emoji: '🪄',
    subtitle: 'Painel, volante, revestimentos',
    estimatedFields: 5,
    backendKey: 'Acabamento Interno',
  },
  {
    id: 'teto_solar',
    name: 'Teto Solar',
    emoji: '☀️',
    subtitle: 'Panorâmico, elétrico, vidro duplo',
    estimatedFields: 3,
    backendKey: 'Teto Solar',
  },
  {
    id: 'bancos',
    name: 'Bancos',
    emoji: '🪑',
    subtitle: 'Material, ajuste, aquecimento, ventilação',
    estimatedFields: 6,
    backendKey: 'Bancos',
  },
  {
    id: 'iluminacao',
    name: 'Iluminação',
    emoji: '💡',
    subtitle: 'Faróis LED, DRL, luz interna, neblina',
    estimatedFields: 5,
    backendKey: 'Iluminação',
  },
  {
    id: 'tracao_offroad',
    name: 'Tração 4x4 e Off-Road',
    emoji: '🏔️',
    subtitle: 'Reduzida, bloqueio de diferencial, modos',
    estimatedFields: 5,
    backendKey: 'Tração 4x4 e Off-Road',
  },
  {
    id: 'outros',
    name: 'Outros',
    emoji: '📋',
    subtitle: 'Demais especificações não categorizadas',
    estimatedFields: 4,
    backendKey: 'Outros',
  },
];

// ── Fontes de pesquisa (para tela Processing) ─────────────────────────────
export const SEARCH_SOURCES: SearchSource[] = [
  {
    id: 'official',
    name: 'Site oficial da montadora',
    icon: '🏭',
    maxFields: 12,
    type: 'official',
  },
  {
    id: 'reviews',
    name: 'Quatro Rodas / iCarros',
    icon: '📰',
    maxFields: 8,
    type: 'review',
  },
  {
    id: 'youtube',
    name: 'YouTube — Reviews',
    icon: '▶️',
    maxFields: 6,
    type: 'review',
  },
  {
    id: 'presskit',
    name: 'Press kits e PDFs',
    icon: '📄',
    maxFields: 4,
    type: 'estimated',
  },
];

// Mapeamento de ícones para as 14 categorias exatas
export const CATEGORY_ICONS: Record<string, string> = {
  'motor e transmissão': '⚙️',
  'rodas': '🛞',
  'conectividade': '📶',
  'entretenimento e multimidia': '📺',
  'ar-condicionado': '❄️',
  'segurança': '🛡️',
  'tecnologia avançada': '🚀',
  'travamento e vidros': '🔒',
  'acabamento interno': '🧵',
  'teto solar': '☀️',
  'bancos': '💺',
  'iluminação': '💡',
  'tração 4x4 e off-road': '⛰️',
  'outros': '📦',
};

// Configuração fixa de Badges baseada no tipo de fonte mapeado
export type SourceType = 'Oficial' | 'Review' | 'Estimado';

export const SOURCE_BADGE_CONFIG: Record<SourceType, { bg: string; color: string }> = {
  Oficial:  { bg: '#e6f4ea', color: '#137333' },
  Review:   { bg: '#fef7e0', color: '#b06000' },
  Estimado: { bg: '#edf0fb', color: '#1a73e8' },
};

// Objeto que simula exatamente o retorno do backend para o veículo analisado
export const MOCK_BACKEND_RANGER_RESPONSE = {
  "searchId": "604ba30d-4aee-4687-8d19-78a788566158",
  "vehicle": {
    "brand": "Ford",
    "model": "Ranger",
    "trim": "Limited 3.0L V6 26MY",
    "year": 2026
  },
  "status": "COMPLETED",
  "completedAt": "2026-05-17T15:40:57.173623Z",
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
      "Tampa do Porta-malas automatico": { "value": "Não se aplica (Caçamba manual com assistente)", "source": "OFFICIAL" }
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
      "Banco posições Elétrico (cada posição)": { "value": "Sim (8 posições para motorista)", "source": "OFFICIAL" },
      "Banco Traseiro Bipartido (60/40)": { "value": "Sim", "source": "OFFICIAL" },
      "Bancos Aquecimento (Frontal)": { "value": "Não", "source": "ESTIMATED" }
    },
    "Iluminação": {
      "Faróis Full LED": { "value": "Sim (Matrix LED)", "source": "OFFICIAL" },
      "LED Day time running lights (DTRL) + Signature Lights": { "value": "Sim", "source": "OFFICIAL" },
      "Farol alto automático": { "value": "Sim", "source": "OFFICIAL" },
      "Iluminação Ambiente Multi-Color (Ambient Light)": { "value": "Sim", "source": "REVIEW" }
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
};