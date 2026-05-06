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
  { id: 'toyota',     name: 'Toyota',     modelCount: 8,  country: 'Japão'    },
  { id: 'hyundai',    name: 'Hyundai',    modelCount: 7,  country: 'Coreia'   },
  { id: 'volkswagen', name: 'Volkswagen', modelCount: 9,  country: 'Alemanha' },
  { id: 'jeep',       name: 'Jeep',       modelCount: 6,  country: 'EUA'      },
  { id: 'chevrolet',  name: 'Chevrolet',  modelCount: 7,  country: 'EUA'      },
  { id: 'honda',      name: 'Honda',      modelCount: 5,  country: 'Japão'    },
  { id: 'ford',       name: 'Ford',       modelCount: 5,  country: 'EUA'      },
  { id: 'nissan',     name: 'Nissan',     modelCount: 5,  country: 'Japão'    },
  { id: 'fiat',       name: 'Fiat',       modelCount: 6,  country: 'Itália'   },
  { id: 'renault',    name: 'Renault',    modelCount: 5,  country: 'França'   },
  { id: 'mitsubishi', name: 'Mitsubishi', modelCount: 4,  country: 'Japão'    },
  { id: 'kia',        name: 'Kia',        modelCount: 6,  country: 'Coreia'   },
  { id: 'bmw',        name: 'BMW',        modelCount: 8,  country: 'Alemanha' },
  { id: 'mercedes',   name: 'Mercedes-Benz', modelCount: 9, country: 'Alemanha' },
];

// ── Modelos por marca ────────────────────────────────────────────────────
const VEHICLE_MODELS: VehicleModel[] = [
  // Toyota
  { id: 'corolla_cross',  brandId: 'toyota',     name: 'Corolla Cross',  segment: 'SUV compacto' },
  { id: 'corolla',        brandId: 'toyota',     name: 'Corolla',        segment: 'Sedan médio'  },
  { id: 'yaris',          brandId: 'toyota',     name: 'Yaris',          segment: 'Hatch compacto' },
  { id: 'rav4',           brandId: 'toyota',     name: 'RAV4',           segment: 'SUV médio'    },
  { id: 'hilux',          brandId: 'toyota',     name: 'Hilux',          segment: 'Picape'       },
  { id: 'sw4',            brandId: 'toyota',     name: 'SW4',            segment: 'SUV grande'   },
  { id: 'camry',          brandId: 'toyota',     name: 'Camry',          segment: 'Sedan grande' },
  { id: 'prius',          brandId: 'toyota',     name: 'Prius',          segment: 'Sedan híbrido' },
  // Hyundai
  { id: 'creta',          brandId: 'hyundai',    name: 'Creta',          segment: 'SUV compacto' },
  { id: 'tucson',         brandId: 'hyundai',    name: 'Tucson',         segment: 'SUV médio'    },
  { id: 'hb20',           brandId: 'hyundai',    name: 'HB20',           segment: 'Hatch compacto' },
  { id: 'ix35',           brandId: 'hyundai',    name: 'ix35',           segment: 'SUV compacto' },
  { id: 'santa_fe',       brandId: 'hyundai',    name: 'Santa Fé',       segment: 'SUV grande'   },
  // Volkswagen
  { id: 'taos',           brandId: 'volkswagen', name: 'Taos',           segment: 'SUV compacto' },
  { id: 'polo',           brandId: 'volkswagen', name: 'Polo',           segment: 'Hatch compacto' },
  { id: 'virtus',         brandId: 'volkswagen', name: 'Virtus',         segment: 'Sedan compacto' },
  { id: 'tcross',         brandId: 'volkswagen', name: 'T-Cross',        segment: 'SUV subcompacto' },
  { id: 'tiguan',         brandId: 'volkswagen', name: 'Tiguan',         segment: 'SUV médio'    },
  // Jeep
  { id: 'compass',        brandId: 'jeep',       name: 'Compass',        segment: 'SUV médio'    },
  { id: 'renegade',       brandId: 'jeep',       name: 'Renegade',       segment: 'SUV compacto' },
  { id: 'commander',      brandId: 'jeep',       name: 'Commander',      segment: 'SUV grande'   },
  // Chevrolet
  { id: 'onix',           brandId: 'chevrolet',  name: 'Onix',           segment: 'Hatch compacto' },
  { id: 'tracker',        brandId: 'chevrolet',  name: 'Tracker',        segment: 'SUV compacto' },
  { id: 'spin',           brandId: 'chevrolet',  name: 'Spin',           segment: 'Minivan'      },
  // Honda
  { id: 'hr_v',           brandId: 'honda',      name: 'HR-V',           segment: 'SUV compacto' },
  { id: 'civic',          brandId: 'honda',      name: 'Civic',          segment: 'Sedan médio'  },
  { id: 'city',           brandId: 'honda',      name: 'City',           segment: 'Sedan compacto' },
];

// ── Versões por modelo ────────────────────────────────────────────────────
const VEHICLE_VERSIONS: VehicleVersion[] = [
  // Corolla Cross
  { id: 'cc_xre_24',    modelId: 'corolla_cross', name: 'XRE',           year: '2024', engine: '2.0 Flex Híbrido', transmission: 'CVT'   },
  { id: 'cc_xei_24',    modelId: 'corolla_cross', name: 'XEi',           year: '2024', engine: '1.8 Flex',        transmission: 'CVT'   },
  { id: 'cc_xls_24',    modelId: 'corolla_cross', name: 'XLS',           year: '2024', engine: '2.0 Flex Híbrido', transmission: 'CVT'  },
  { id: 'cc_gls_23',    modelId: 'corolla_cross', name: 'GLS',           year: '2023', engine: '2.0 Flex',        transmission: 'CVT'   },
  // Creta
  { id: 'cr_nline_24',  modelId: 'creta',         name: 'N Line',        year: '2024', engine: '1.0 Turbo GDi',   transmission: 'DCT 7v' },
  { id: 'cr_limited_24',modelId: 'creta',         name: 'Limited',       year: '2024', engine: '2.0 MPi',         transmission: 'Aut 6v' },
  { id: 'cr_action_24', modelId: 'creta',         name: 'Action',        year: '2024', engine: '1.0 Turbo GDi',   transmission: 'Manual' },
  { id: 'cr_smart_23',  modelId: 'creta',         name: 'Smart',         year: '2023', engine: '2.0 MPi',         transmission: 'Aut 6v' },
  // Taos
  { id: 'ts_high_24',   modelId: 'taos',          name: 'Highline',      year: '2024', engine: '1.4 Turbo 150cv', transmission: 'DSG 7v' },
  { id: 'ts_comf_24',   modelId: 'taos',          name: 'Comfortline',   year: '2024', engine: '1.4 Turbo 150cv', transmission: 'DSG 7v' },
  { id: 'ts_trend_24',  modelId: 'taos',          name: 'Trendline',     year: '2024', engine: '1.4 Turbo 125cv', transmission: 'Manual' },
  // Compass
  { id: 'cp_limited_24',modelId: 'compass',       name: 'Limited',       year: '2024', engine: '1.3 Turbo 185cv', transmission: 'Aut 9v' },
  { id: 'cp_series_24', modelId: 'compass',       name: 'S',             year: '2024', engine: '1.3 Turbo 185cv', transmission: 'Aut 9v' },
  { id: 'cp_long_24',   modelId: 'compass',       name: 'Longitude',     year: '2024', engine: '1.3 Turbo 150cv', transmission: 'Aut 6v' },
  // HR-V
  { id: 'hrv_advance',  modelId: 'hr_v',          name: 'Advance',       year: '2024', engine: '1.5 Turbo 177cv', transmission: 'CVT'   },
  { id: 'hrv_touring',  modelId: 'hr_v',          name: 'Touring',       year: '2024', engine: '1.5 Turbo 177cv', transmission: 'CVT'   },
  // Tracker
  { id: 'tr_premier',   modelId: 'tracker',       name: 'Premier',       year: '2024', engine: '1.2 Turbo 133cv', transmission: 'CVT'   },
  { id: 'tr_redline',   modelId: 'tracker',       name: 'Redline',       year: '2024', engine: '1.2 Turbo 133cv', transmission: 'CVT'   },
];

// ── Helpers ────────────────────────────────────────────────────────────────
export function getModelsByBrand(brandId: string): VehicleModel[] {
  return VEHICLE_MODELS.filter((m) => m.brandId === brandId);
}

export function getVersionsByModel(modelId: string): VehicleVersion[] {
  return VEHICLE_VERSIONS.filter((v) => v.modelId === modelId);
}

// ── Categorias de pesquisa ────────────────────────────────────────────────
export const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    id: 'motor',
    name: 'Motor',
    emoji: '⚡',
    subtitle: 'Potência, torque, câmbio',
    estimatedFields: 6,
  },
  {
    id: 'dimensoes',
    name: 'Dimensões',
    emoji: '📐',
    subtitle: 'Porta-malas, tanque',
    estimatedFields: 5,
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia',
    emoji: '📱',
    subtitle: 'ADAS, central multimídia',
    estimatedFields: 7,
  },
  {
    id: 'seguranca',
    name: 'Segurança',
    emoji: '🛡️',
    subtitle: 'Airbags, assistências',
    estimatedFields: 6,
  },
  {
    id: 'consumo',
    name: 'Consumo',
    emoji: '⛽',
    subtitle: 'Etanol, gasolina, CO₂',
    estimatedFields: 4,
  },
  {
    id: 'conforto',
    name: 'Conforto',
    emoji: '🪑',
    subtitle: 'Equipamentos de série',
    estimatedFields: 5,
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