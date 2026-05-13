// src/mocks/compareData.ts
//
// Dados mockados para a tela de comparação de veículos.
//
// Fotos: usamos a API gratuita do NHTSA (imagens via Wikipedia Commons) +
// URLs do Unsplash (gratuito, sem chave para uso direto via source.unsplash.com)
//
// API REAL gratuita recomendada: https://www.carqueryapi.com/
//   GET https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=toyota&year=2024
//
// Para fotos de alta qualidade (gratuito até 100 req/dia):
//   https://car-api.io  |  https://api.unsplash.com

export interface SpecField {
  id: string;
  label: string;
  unit?: string;
  lowerIsBetter?: boolean;
}

export interface SpecCategory {
  id: string;
  name: string;
  emoji: string;
  fields: SpecField[];
}

export interface CompareVehicle {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: string;
  brandColor: string;
  imageUrl: string;
  priceFrom: string;
  aiScore: number;
  totalFields: number;
  categoryScores: Record<string, number>;
  specs: Record<string, string | number>;
  specConfidence: Record<string, 'high' | 'medium' | 'low'>;
}

// ── Categorias e campos de especificação ────────────────────────────────
export const COMPARE_SPEC_CATEGORIES: SpecCategory[] = [
  {
    id: 'motor',
    name: 'Motor e Desempenho',
    emoji: '⚡',
    fields: [
      { id: 'potencia', label: 'Potência máxima', unit: 'cv' },
      { id: 'torque', label: 'Torque máximo', unit: 'kgfm' },
      { id: 'cambio', label: 'Câmbio' },
      { id: 'tracao', label: 'Tração' },
      { id: 'aceleracao', label: '0–100 km/h', unit: 's', lowerIsBetter: true },
      { id: 'vel_max', label: 'Velocidade máxima', unit: 'km/h' },
      { id: 'motor_cc', label: 'Cilindrada', unit: 'cm³' },
      { id: 'cilindros', label: 'Cilindros' },
    ],
  },
  {
    id: 'consumo',
    name: 'Consumo e Eficiência',
    emoji: '⛽',
    fields: [
      { id: 'consumo_cidade', label: 'Consumo cidade (gasolina)', unit: 'km/l', lowerIsBetter: false },
      { id: 'consumo_estrada', label: 'Consumo estrada (gasolina)', unit: 'km/l' },
      { id: 'consumo_etanol_cidade', label: 'Consumo cidade (etanol)', unit: 'km/l' },
      { id: 'consumo_etanol_estrada', label: 'Consumo estrada (etanol)', unit: 'km/l' },
      { id: 'tanque', label: 'Capacidade do tanque', unit: 'L' },
      { id: 'autonomia', label: 'Autonomia estimada', unit: 'km' },
    ],
  },
  {
    id: 'dimensoes',
    name: 'Dimensões e Capacidade',
    emoji: '📐',
    fields: [
      { id: 'comprimento', label: 'Comprimento', unit: 'mm' },
      { id: 'largura', label: 'Largura', unit: 'mm' },
      { id: 'altura', label: 'Altura', unit: 'mm' },
      { id: 'entre_eixos', label: 'Entre-eixos', unit: 'mm' },
      { id: 'porta_malas', label: 'Porta-malas', unit: 'L' },
      { id: 'peso', label: 'Peso em ordem', unit: 'kg' },
      { id: 'capacidade_carga', label: 'Capacidade de carga', unit: 'kg' },
      { id: 'passageiros', label: 'Passageiros' },
    ],
  },
  {
    id: 'seguranca',
    name: 'Segurança',
    emoji: '🛡️',
    fields: [
      { id: 'airbags', label: 'Quantidade de airbags' },
      { id: 'abs', label: 'ABS' },
      { id: 'esp', label: 'Controle de estabilidade (ESP)' },
      { id: 'frenagem_autonoma', label: 'Frenagem autônoma de emergência' },
      { id: 'alerta_faixa', label: 'Alerta de saída de faixa' },
      { id: 'camera_re', label: 'Câmera de ré' },
      { id: 'sensores_re', label: 'Sensores de estacionamento' },
      { id: 'monitor_angulo_morto', label: 'Monitor de ponto cego' },
      { id: 'assistente_faixa', label: 'Assistente de permanência em faixa' },
      { id: 'isofix', label: 'ISOFIX' },
      { id: 'ncap', label: 'Nota NCAP (estrelas)' },
    ],
  },
  {
    id: 'tecnologia',
    name: 'Tecnologia e Conectividade',
    emoji: '📱',
    fields: [
      { id: 'central_multimidia', label: 'Central multimídia', unit: '"' },
      { id: 'painel_digital', label: 'Painel/Cluster digital', unit: '"' },
      { id: 'apple_carplay', label: 'Apple CarPlay' },
      { id: 'android_auto', label: 'Android Auto' },
      { id: 'wifi_hotspot', label: 'Wi-Fi Hotspot' },
      { id: 'carregamento_wireless', label: 'Carregamento sem fio' },
      { id: 'head_up_display', label: 'Head-Up Display (HUD)' },
      { id: 'som_falantes', label: 'Falantes de áudio' },
      { id: 'atualizacoes_ota', label: 'Atualizações OTA' },
    ],
  },
  {
    id: 'conforto',
    name: 'Conforto e Equipamentos',
    emoji: '🪑',
    fields: [
      { id: 'ar_cond', label: 'Ar-condicionado' },
      { id: 'bancos_material', label: 'Material dos bancos' },
      { id: 'bancos_aquecidos', label: 'Bancos dianteiros aquecidos' },
      { id: 'bancos_ventilados', label: 'Bancos dianteiros ventilados' },
      { id: 'ajuste_banco_eletrico', label: 'Ajuste elétrico do banco motorista' },
      { id: 'teto_solar', label: 'Teto solar/panorâmico' },
      { id: 'chave_presencial', label: 'Chave presencial (Keyless)' },
      { id: 'partida_remota', label: 'Partida remota' },
      { id: 'direcao_eletrica', label: 'Direção elétrica' },
      { id: 'farol_led', label: 'Faróis full LED' },
      { id: 'rodas', label: 'Rodas de liga leve', unit: '"' },
    ],
  },
  {
    id: 'garantia',
    name: 'Garantia e Revisões',
    emoji: '📋',
    fields: [
      { id: 'garantia', label: 'Garantia de fábrica', unit: 'anos' },
      { id: 'garantia_km', label: 'Garantia (km)' },
      { id: 'garantia_corrosao', label: 'Garantia anticorrosão', unit: 'anos' },
      { id: 'intervalo_revisao', label: 'Intervalo de revisão', unit: 'km' },
      { id: 'revisoes_inclusas', label: 'Revisões inclusas no preço' },
    ],
  },
];

// ── Veículos mockados (analisados pela IA) ──────────────────────────────
// Imagens via source.unsplash.com (gratuito, sem autenticação)
// Em produção, usar Car API ou NHTSA API para imagens oficiais

export const COMPARE_MOCK_VEHICLES: CompareVehicle[] = [
  {
    id: 'corolla_cross_xre_2024',
    brand: 'Toyota',
    model: 'Corolla Cross',
    version: 'XRE 2.0 Híbrido',
    year: '2024',
    brandColor: '#EB0A1E',
    imageUrl: 'https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/toyota?format=json',
    priceFrom: 'R$ 189.990',
    aiScore: 94,
    totalFields: 68,
    categoryScores: {
      Motor: 88,
      Segurança: 92,
      Tecnologia: 90,
      Conforto: 85,
      'Custo-benefício': 78,
    },
    specConfidence: {
      potencia: 'high', torque: 'high', cambio: 'high', tracao: 'high',
      aceleracao: 'medium', vel_max: 'medium', consumo_cidade: 'high',
      consumo_estrada: 'high', porta_malas: 'high', ncap: 'high',
    },
    specs: {
      // Motor
      potencia: '177 cv (E) / 169 cv (G)',
      torque: '21,4',
      cambio: 'CVT (10 marchas simuladas)',
      tracao: 'Dianteira (FWD)',
      aceleracao: '8,5',
      vel_max: '180',
      motor_cc: '1.987',
      cilindros: '4 cilindros',
      // Consumo
      consumo_cidade: '16,9',
      consumo_estrada: '14,8',
      consumo_etanol_cidade: '12,1',
      consumo_etanol_estrada: '10,6',
      tanque: '50',
      autonomia: '845',
      // Dimensões
      comprimento: '4.460',
      largura: '1.825',
      altura: '1.620',
      entre_eixos: '2.640',
      porta_malas: '487',
      peso: '1.535',
      capacidade_carga: '375',
      passageiros: '5',
      // Segurança
      airbags: '7',
      abs: 'Sim',
      esp: 'Sim (VSC)',
      frenagem_autonoma: 'Sim (Toyota Safety Sense)',
      alerta_faixa: 'Sim (com correção)',
      camera_re: 'Sim',
      sensores_re: 'Sim (dianteiro e traseiro)',
      monitor_angulo_morto: 'Sim',
      assistente_faixa: 'Sim',
      isofix: 'Sim',
      ncap: '5',
      // Tecnologia
      central_multimidia: '10,5',
      painel_digital: '12,3',
      apple_carplay: 'Sim (sem fio)',
      android_auto: 'Sim (sem fio)',
      wifi_hotspot: 'Não',
      carregamento_wireless: 'Sim (15W)',
      head_up_display: 'Não',
      som_falantes: '6',
      atualizacoes_ota: 'Sim',
      // Conforto
      ar_cond: 'Digital dual zone',
      bancos_material: 'Couro/SynTex',
      bancos_aquecidos: 'Sim (dianteiros)',
      bancos_ventilados: 'Não',
      ajuste_banco_eletrico: 'Sim (8 direções)',
      teto_solar: 'Sim (panorâmico)',
      chave_presencial: 'Sim',
      partida_remota: 'Sim',
      direcao_eletrica: 'Sim (EPAS)',
      farol_led: 'Sim',
      rodas: '18',
      // Garantia
      garantia: '3',
      garantia_km: '100.000 km',
      garantia_corrosao: '5',
      intervalo_revisao: '10.000',
      revisoes_inclusas: 'Não',
    },
  },

  {
    id: 'creta_nline_2024',
    brand: 'Hyundai',
    model: 'Creta',
    version: 'N Line 1.0 Turbo',
    year: '2024',
    brandColor: '#002C5F',
    imageUrl: 'https://source.unsplash.com/featured/800x450/?hyundai,creta,suv',
    priceFrom: 'R$ 156.490',
    aiScore: 91,
    totalFields: 61,
    categoryScores: {
      Motor: 82,
      Segurança: 88,
      Tecnologia: 92,
      Conforto: 88,
      'Custo-benefício': 86,
    },
    specConfidence: {
      potencia: 'high', torque: 'high', cambio: 'high', aceleracao: 'medium',
      consumo_cidade: 'high', consumo_estrada: 'high', ncap: 'high',
    },
    specs: {
      // Motor
      potencia: '120 cv',
      torque: '20,4',
      cambio: 'DCT 7 velocidades',
      tracao: 'Dianteira (FWD)',
      aceleracao: '10,2',
      vel_max: '185',
      motor_cc: '998',
      cilindros: '3 cilindros Turbo',
      // Consumo
      consumo_cidade: '13,0',
      consumo_estrada: '14,3',
      consumo_etanol_cidade: '9,4',
      consumo_etanol_estrada: '10,3',
      tanque: '50',
      autonomia: '715',
      // Dimensões
      comprimento: '4.300',
      largura: '1.790',
      altura: '1.625',
      entre_eixos: '2.610',
      porta_malas: '391',
      peso: '1.302',
      capacidade_carga: '398',
      passageiros: '5',
      // Segurança
      airbags: '6',
      abs: 'Sim',
      esp: 'Sim (ESC)',
      frenagem_autonoma: 'Sim (FCA)',
      alerta_faixa: 'Sim',
      camera_re: 'Sim (360°)',
      sensores_re: 'Sim',
      monitor_angulo_morto: 'Sim (BCW)',
      assistente_faixa: 'Sim (LKA)',
      isofix: 'Sim',
      ncap: '5',
      // Tecnologia
      central_multimidia: '10,25',
      painel_digital: '10,25',
      apple_carplay: 'Sim (sem fio)',
      android_auto: 'Sim (sem fio)',
      wifi_hotspot: 'Sim',
      carregamento_wireless: 'Sim (15W)',
      head_up_display: 'Sim',
      som_falantes: '8',
      atualizacoes_ota: 'Sim',
      // Conforto
      ar_cond: 'Digital dual zone',
      bancos_material: 'Couro',
      bancos_aquecidos: 'Sim (dianteiros)',
      bancos_ventilados: 'Sim (dianteiros)',
      ajuste_banco_eletrico: 'Sim (10 direções)',
      teto_solar: 'Não',
      chave_presencial: 'Sim',
      partida_remota: 'Sim',
      direcao_eletrica: 'Sim (MDPS)',
      farol_led: 'Sim',
      rodas: '17',
      // Garantia
      garantia: '5',
      garantia_km: '100.000 km',
      garantia_corrosao: '3',
      intervalo_revisao: '15.000',
      revisoes_inclusas: 'Não',
    },
  },

  {
    id: 'taos_highline_2024',
    brand: 'Volkswagen',
    model: 'Taos',
    version: 'Highline 1.4 Turbo',
    year: '2024',
    brandColor: '#001E50',
    imageUrl: 'https://source.unsplash.com/featured/800x450/?volkswagen,suv,crossover',
    priceFrom: 'R$ 179.990',
    aiScore: 89,
    totalFields: 57,
    categoryScores: {
      Motor: 86,
      Segurança: 90,
      Tecnologia: 88,
      Conforto: 84,
      'Custo-benefício': 80,
    },
    specConfidence: {
      potencia: 'high', torque: 'high', cambio: 'high', aceleracao: 'medium',
      consumo_cidade: 'high', consumo_estrada: 'high',
    },
    specs: {
      // Motor
      potencia: '150 cv',
      torque: '25,5',
      cambio: 'DSG 7 velocidades',
      tracao: 'Dianteira (FWD)',
      aceleracao: '9,0',
      vel_max: '210',
      motor_cc: '1.395',
      cilindros: '4 cilindros Turbo',
      // Consumo
      consumo_cidade: '13,5',
      consumo_estrada: '16,1',
      consumo_etanol_cidade: '9,8',
      consumo_etanol_estrada: '11,5',
      tanque: '50',
      autonomia: '805',
      // Dimensões
      comprimento: '4.468',
      largura: '1.839',
      altura: '1.632',
      entre_eixos: '2.680',
      porta_malas: '471',
      peso: '1.379',
      capacidade_carga: '421',
      passageiros: '5',
      // Segurança
      airbags: '8',
      abs: 'Sim',
      esp: 'Sim (ESC+)',
      frenagem_autonoma: 'Sim (Front Assist)',
      alerta_faixa: 'Sim (Lane Assist)',
      camera_re: 'Sim',
      sensores_re: 'Sim',
      monitor_angulo_morto: 'Sim (Side Assist)',
      assistente_faixa: 'Sim',
      isofix: 'Sim',
      ncap: '5',
      // Tecnologia
      central_multimidia: '10,1',
      painel_digital: '10,25',
      apple_carplay: 'Sim (com fio)',
      android_auto: 'Sim (com fio)',
      wifi_hotspot: 'Não',
      carregamento_wireless: 'Sim',
      head_up_display: 'Não',
      som_falantes: '6',
      atualizacoes_ota: 'Não',
      // Conforto
      ar_cond: 'Climatronic dual zone',
      bancos_material: 'Couro/tecido',
      bancos_aquecidos: 'Sim',
      bancos_ventilados: 'Não',
      ajuste_banco_eletrico: 'Sim (8 direções)',
      teto_solar: 'Sim',
      chave_presencial: 'Sim',
      partida_remota: 'Não',
      direcao_eletrica: 'Sim',
      farol_led: 'Sim (Matrix)',
      rodas: '18',
      // Garantia
      garantia: '3',
      garantia_km: '100.000 km',
      garantia_corrosao: '12',
      intervalo_revisao: '15.000',
      revisoes_inclusas: 'Sim (3 revisões)',
    },
  },

  {
    id: 'compass_limited_2024',
    brand: 'Jeep',
    model: 'Compass',
    version: 'Limited 1.3 Turbo T270',
    year: '2024',
    brandColor: '#4A4A4A',
    imageUrl: 'https://source.unsplash.com/featured/800x450/?jeep,compass,suv',
    priceFrom: 'R$ 207.990',
    aiScore: 87,
    totalFields: 54,
    categoryScores: {
      Motor: 84,
      Segurança: 86,
      Tecnologia: 85,
      Conforto: 90,
      'Custo-benefício': 72,
    },
    specConfidence: {
      potencia: 'high', torque: 'high', cambio: 'high', aceleracao: 'medium',
      consumo_cidade: 'high', consumo_estrada: 'high',
    },
    specs: {
      // Motor
      potencia: '185 cv',
      torque: '27,5',
      cambio: 'Automático 9 velocidades',
      tracao: 'Dianteira (FWD)',
      aceleracao: '8,4',
      vel_max: '205',
      motor_cc: '1.332',
      cilindros: '4 cilindros Turbo',
      // Consumo
      consumo_cidade: '11,7',
      consumo_estrada: '13,9',
      consumo_etanol_cidade: '8,4',
      consumo_etanol_estrada: '10,1',
      tanque: '54',
      autonomia: '750',
      // Dimensões
      comprimento: '4.395',
      largura: '1.859',
      altura: '1.665',
      entre_eixos: '2.636',
      porta_malas: '438',
      peso: '1.536',
      capacidade_carga: '364',
      passageiros: '5',
      // Segurança
      airbags: '9',
      abs: 'Sim',
      esp: 'Sim (ESC)',
      frenagem_autonoma: 'Sim',
      alerta_faixa: 'Sim',
      camera_re: 'Sim (360°)',
      sensores_re: 'Sim',
      monitor_angulo_morto: 'Sim (BSM)',
      assistente_faixa: 'Sim (LDW)',
      isofix: 'Sim',
      ncap: '5',
      // Tecnologia
      central_multimidia: '10,1',
      painel_digital: '7,0',
      apple_carplay: 'Sim (sem fio)',
      android_auto: 'Sim (sem fio)',
      wifi_hotspot: 'Sim',
      carregamento_wireless: 'Sim',
      head_up_display: 'Não',
      som_falantes: '9',
      atualizacoes_ota: 'Sim',
      // Conforto
      ar_cond: 'Digital dual zone',
      bancos_material: 'Couro',
      bancos_aquecidos: 'Sim',
      bancos_ventilados: 'Sim',
      ajuste_banco_eletrico: 'Sim',
      teto_solar: 'Sim (panorâmico)',
      chave_presencial: 'Sim',
      partida_remota: 'Sim',
      direcao_eletrica: 'Sim',
      farol_led: 'Sim',
      rodas: '19',
      // Garantia
      garantia: '3',
      garantia_km: '100.000 km',
      garantia_corrosao: '3',
      intervalo_revisao: '10.000',
      revisoes_inclusas: 'Não',
    },
  },
];
