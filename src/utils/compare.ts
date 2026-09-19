// src/utils/compare.ts
//
// Regras de negócio da comparação de veículos — tudo que não é pixel.
//
// Não existe endpoint de comparação na API. O comparativo é montado no cliente
// a partir de N respostas de GET /v1/searches/{id}/result, cujo `specs` tem a
// forma:
//
//   { "<categoria>": { "<campo>": { value, source } }, ..., "sources": ... }
//
// Daí saem as três regras que governam esta tela:
//
//   1. AS CATEGORIAS PESQUISADAS SÃO AS CHAVES DE `specs`.
//      Não é preciso guardar nada nem confiar em navigation params: o que a
//      pesquisa cobriu está no próprio resultado. Se a IA falhou em extrair uma
//      categoria, ela não aparece — e uma categoria sem dado não seria
//      comparável de qualquer forma.
//
//   2. COMPARA-SE A INTERSEÇÃO, NÃO A IGUALDADE.
//      Exigir conjuntos idênticos bloquearia a tela por um motivo que muitas
//      vezes não é do usuário (a IA dropou uma categoria). Compara-se o que é
//      comum e diz-se em voz alta o que ficou de fora.
//
//   3. NADA SOME EM SILÊNCIO.
//      Os nomes dos campos são texto livre gerado pela IA. O casamento aqui é
//      deliberadamente conservador — só diferenças de caixa, acento, pontuação
//      e espaço. "Potência (cv)" e "Potência máxima" NÃO viram a mesma linha:
//      viram duas linhas, cada uma preenchida de um lado só.
//      É proposital. Um casamento esperto (dicionário de sinônimos, remoção do
//      que está entre parênteses) casaria "Consumo (cidade)" com
//      "Consumo (estrada)" e produziria uma tabela errada sem avisar ninguém.
//      Preferimos a linha meio vazia — ela é visível e denuncia o problema.

import type { SearchResultResponse, SpecField } from '../types/api';

/** Chave que o backend usa para guardar as fontes dentro do próprio `specs`. */
export const SOURCES_KEY = 'sources';

type RawSpecs = Record<string, unknown>;

/* ── Normalização ────────────────────────────────────────────────────────── */

/**
 * Chave de casamento entre rótulos vindos de pesquisas diferentes.
 * Conservadora de propósito — ver nota 3 no topo do arquivo.
 */
export function matchKey(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const isFieldMap = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * Aceita tanto `{ value, source }` quanto uma string solta — a IA já devolveu
 * as duas formas. Devolve null para campo vazio, que é diferente de "Não".
 */
function toSpecField(raw: unknown): SpecField | null {
  if (raw == null) return null;
  if (typeof raw === 'string' || typeof raw === 'number') {
    const value = String(raw).trim();
    return value ? { value, source: 'ESTIMATED' } : null;
  }
  if (isFieldMap(raw)) {
    const value = (raw as { value?: unknown }).value;
    if (value == null || String(value).trim() === '') return null;
    const source = (raw as { source?: unknown }).source;
    return {
      value: String(value).trim(),
      source: (typeof source === 'string' ? source : 'ESTIMATED') as SpecField['source'],
    };
  }
  return null;
}

/** As categorias que esta pesquisa efetivamente cobriu. Regra 1. */
export function categoriesOf(specs: unknown): string[] {
  if (!isFieldMap(specs)) return [];
  return Object.keys(specs).filter((key) => key !== SOURCES_KEY && isFieldMap(specs[key]));
}

/* ── Leitura de valores ──────────────────────────────────────────────────── */

/**
 * Converte o primeiro número do texto respeitando a notação pt-BR.
 *
 *   "1.987 cm3"                -> 1987     (e não 1.987)
 *   "21,4 kgfm"                -> 21.4
 *   "2.0 Turbo"                -> 2        (dois dígitos após o ponto != milhar)
 *   "177 cv (E) / 169 cv (G)"  -> 177
 *   "Sim (VSC)"                -> null
 */
export function parseNumber(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const match = raw.match(/-?\d[\d.,]*/);
  if (!match) return null;

  let token = match[0].replace(/[.,]+$/, '');

  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(token)) {
    // 1.987 · 1.234.567,89 — ponto é separador de milhar
    token = token.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d+,\d+$/.test(token)) {
    // 21,4 — vírgula é decimal
    token = token.replace(',', '.');
  } else if (!/^-?\d+(\.\d+)?$/.test(token)) {
    token = token.replace(/\./g, '').replace(',', '.');
  }

  const parsed = Number(token);
  return Number.isFinite(parsed) ? parsed : null;
}

const YES = /^(sim|possui|disponivel|disponível|de serie|de série|serie|série|standard|padrao|padrão|inclu)/i;
const NO = /^(nao|não|indisponivel|indisponível|ausente|inexistente|n\/[ad])/i;

/**
 * Sim/Não do campo. "Opcional" devolve null de propósito: um item opcional não
 * perde nem ganha de um item de série sem que alguém decida a regra comercial.
 */
export function parseBoolean(raw: string | null | undefined): boolean | null {
  if (!raw) return null;
  const value = raw.trim();
  if (YES.test(value)) return true;
  if (NO.test(value)) return false;
  return null;
}

/* ── Direção do "melhor" ─────────────────────────────────────────────────── */

type Direction = 'higher' | 'lower';

/**
 * Dicionário curado e curto. Campo que não está aqui NÃO ganha destaque, mesmo
 * que os dois lados sejam numéricos — eleger "Cilindrada: 1987" como vitória é
 * opinião, não dado.
 */
const NUMERIC_RULES: Array<{ tokens: string[]; dir: Direction }> = [
  { tokens: ['potencia'], dir: 'higher' },
  { tokens: ['torque'], dir: 'higher' },
  { tokens: ['aceleracao', '0 100', '0 a 100'], dir: 'lower' },
  { tokens: ['velocidade maxima'], dir: 'higher' },
  { tokens: ['consumo', 'autonomia'], dir: 'higher' },
  { tokens: ['tanque'], dir: 'higher' },
  { tokens: ['porta malas', 'porta mala', 'bagageiro'], dir: 'higher' },
  { tokens: ['capacidade de carga', 'carga util'], dir: 'higher' },
  { tokens: ['entre eixos'], dir: 'higher' },
  { tokens: ['altura livre', 'vao livre'], dir: 'higher' },
  { tokens: ['angulo de ataque', 'angulo de saida', 'angulo ventral'], dir: 'higher' },
  { tokens: ['profundidade de vau'], dir: 'higher' },
  { tokens: ['airbag'], dir: 'higher' },
  { tokens: ['ncap', 'estrela'], dir: 'higher' },
  { tokens: ['garantia'], dir: 'higher' },
  { tokens: ['intervalo de revisao'], dir: 'higher' },
  { tokens: ['falante'], dir: 'higher' },
  { tokens: ['aro', 'roda'], dir: 'higher' },
  { tokens: ['multimidia', 'cluster', 'painel digital', 'tela'], dir: 'higher' },
  { tokens: ['peso'], dir: 'lower' },
  { tokens: ['emissao', 'co2'], dir: 'lower' },
  { tokens: ['preco', 'valor'], dir: 'lower' },
];

function directionFor(fieldKey: string, values: string[]): Direction | null {
  const rule = NUMERIC_RULES.find((entry) => entry.tokens.some((token) => fieldKey.includes(token)));
  if (!rule) return null;
  // Consumo em L/100km inverte a leitura — sem certeza da unidade, não destaca.
  if (rule.tokens.includes('consumo') && values.some((v) => /l\s*\/\s*100/i.test(v))) return null;
  return rule.dir;
}

/* ── Modelo da comparação ────────────────────────────────────────────────── */

export interface CompareRow {
  /** Chave normalizada — estável entre veículos. */
  key: string;
  /** Rótulo exibido: o primeiro que apareceu. */
  label: string;
  /** Rótulo original de cada veículo (null quando o veículo não tem o campo). */
  labels: Array<string | null>;
  /** true quando os veículos nomearam o mesmo campo de formas diferentes. */
  labelsDiverge: boolean;
  cells: Array<SpecField | null>;
  /** Quantos veículos trouxeram valor para esta linha. */
  filled: number;
  /** true quando todos os veículos comparados têm valor. */
  comparable: boolean;
  /** Índice do vencedor, ou -1. */
  winner: number;
  winnerKind: 'numeric' | 'boolean' | null;
}

export interface CompareCategory {
  key: string;
  name: string;
  /** Índices dos veículos que trouxeram esta categoria. */
  presentIn: number[];
  /** true quando todos os veículos comparados pesquisaram esta categoria. */
  shared: boolean;
  rows: CompareRow[];
  comparableRows: number;
}

export interface CompareStats {
  /** Linhas preenchidas em todos os veículos. */
  comparableFields: number;
  /** Linhas distintas no total (compartilhadas + exclusivas). */
  totalFields: number;
  /** Campos que só um veículo tem, por veículo. */
  exclusiveFields: number[];
  /** Total de campos trazidos por veículo. */
  fieldsPerVehicle: number[];
}

export interface CompareModel {
  /** Categorias presentes em TODOS os veículos — o comparativo propriamente. */
  categories: CompareCategory[];
  /** Categorias que faltam em pelo menos um veículo. Mostradas à parte. */
  exclusive: CompareCategory[];
  stats: CompareStats;
}

const EMPTY: CompareModel = {
  categories: [],
  exclusive: [],
  stats: { comparableFields: 0, totalFields: 0, exclusiveFields: [], fieldsPerVehicle: [] },
};

/**
 * Monta o comparativo. Preserva a ordem de leitura da ResultScreen: categorias
 * e campos saem na ordem em que o primeiro veículo que os possui os apresentou;
 * o que for exclusivo dos demais entra no fim.
 *
 * @param highlight quando false, nenhum vencedor é calculado.
 */
export function buildComparison(
  results: Array<SearchResultResponse | undefined>,
  highlight = true,
): CompareModel {
  const vehicles = results.length;
  if (vehicles < 2) return EMPTY;

  const specsList: RawSpecs[] = results.map((result) =>
    isFieldMap(result?.specs) ? (result!.specs as RawSpecs) : {},
  );
  const categoryNames = specsList.map(categoriesOf);

  // União das categorias, na ordem do primeiro veículo que as apresentou.
  const categoryOrder: string[] = [];
  const categoryDisplay = new Map<string, string>();
  categoryNames.forEach((names) =>
    names.forEach((name) => {
      const key = matchKey(name);
      if (!key || categoryDisplay.has(key)) return;
      categoryDisplay.set(key, name);
      categoryOrder.push(key);
    }),
  );

  const shared: CompareCategory[] = [];
  const exclusive: CompareCategory[] = [];
  const exclusiveFields = new Array<number>(vehicles).fill(0);
  const fieldsPerVehicle = new Array<number>(vehicles).fill(0);
  let comparableFields = 0;
  let totalFields = 0;

  categoryOrder.forEach((categoryKey) => {
    // Nome que CADA veículo usou para esta categoria (null = não pesquisou).
    const namePerVehicle = categoryNames.map(
      (names) => names.find((name) => matchKey(name) === categoryKey) ?? null,
    );
    const presentIn = namePerVehicle
      .map((name, index) => (name ? index : -1))
      .filter((index) => index >= 0);

    const rowOrder: string[] = [];
    const labels = new Map<string, Array<string | null>>();
    const cells = new Map<string, Array<SpecField | null>>();

    namePerVehicle.forEach((categoryName, vehicleIndex) => {
      if (!categoryName) return;
      const fields = specsList[vehicleIndex][categoryName];
      if (!isFieldMap(fields)) return;

      Object.entries(fields).forEach(([label, raw]) => {
        const key = matchKey(label);
        if (!key) return;
        if (!cells.has(key)) {
          rowOrder.push(key);
          cells.set(key, new Array(vehicles).fill(null));
          labels.set(key, new Array(vehicles).fill(null));
        }
        const field = toSpecField(raw);
        cells.get(key)![vehicleIndex] = field;
        labels.get(key)![vehicleIndex] = label;
        if (field) fieldsPerVehicle[vehicleIndex] += 1;
      });
    });

    const isShared = presentIn.length === vehicles;

    const rows: CompareRow[] = rowOrder.map((key) => {
      const rowCells = cells.get(key)!;
      const rowLabels = labels.get(key)!;
      const filled = rowCells.filter(Boolean).length;
      const comparable = isShared && filled === vehicles;

      totalFields += 1;
      if (comparable) comparableFields += 1;
      if (filled === 1) {
        const only = rowCells.findIndex(Boolean);
        if (only >= 0) exclusiveFields[only] += 1;
      }

      const distinctLabels = new Set(rowLabels.filter(Boolean) as string[]);
      const outcome =
        highlight && comparable
          ? resolveWinner(key, rowCells as SpecField[])
          : { winner: -1, winnerKind: null as CompareRow['winnerKind'] };

      return {
        key,
        label: (rowLabels.find(Boolean) as string) ?? key,
        labels: rowLabels,
        labelsDiverge: distinctLabels.size > 1,
        cells: rowCells,
        filled,
        comparable,
        winner: outcome.winner,
        winnerKind: outcome.winnerKind,
      };
    });

    const category: CompareCategory = {
      key: categoryKey,
      name: categoryDisplay.get(categoryKey) ?? categoryKey,
      presentIn,
      shared: isShared,
      rows,
      comparableRows: rows.filter((row) => row.comparable).length,
    };

    (isShared ? shared : exclusive).push(category);
  });

  return {
    categories: shared,
    exclusive,
    stats: { comparableFields, totalFields, exclusiveFields, fieldsPerVehicle },
  };
}

/**
 * Destaque factual e estreito:
 *
 *   • numérico — só quando TODOS os lados parseiam e o campo está no dicionário
 *     curado, que é quem define se maior ou menor é melhor;
 *   • Sim/Não  — quem tem o item ganha de quem não tem;
 *   • empate ou qualquer valor ESTIMATED entre os comparados -> sem destaque.
 *
 * O último critério é o que mantém a tela coerente com o resto do app: o
 * produto vende procedência, e coroar um vencedor com base num dado que a
 * própria IA marcou como inferido contradiz isso.
 */
function resolveWinner(
  fieldKey: string,
  cells: SpecField[],
): { winner: number; winnerKind: CompareRow['winnerKind'] } {
  const none = { winner: -1, winnerKind: null as CompareRow['winnerKind'] };
  if (cells.some((cell) => cell.source === 'ESTIMATED')) return none;

  const values = cells.map((cell) => cell.value);

  const numbers = values.map(parseNumber);
  if (numbers.every((entry): entry is number => entry != null)) {
    const direction = directionFor(fieldKey, values);
    if (!direction) return none;
    const best = direction === 'lower' ? Math.min(...numbers) : Math.max(...numbers);
    if (numbers.filter((entry) => entry === best).length !== 1) return none;
    return { winner: numbers.indexOf(best), winnerKind: 'numeric' };
  }

  const booleans = values.map(parseBoolean);
  if (booleans.every((entry): entry is boolean => entry != null)) {
    if (booleans.filter(Boolean).length !== 1) return none;
    return { winner: booleans.indexOf(true), winnerKind: 'boolean' };
  }

  return none;
}

/** Rótulo curto do veículo, usado em cabeçalhos e chips. */
export function vehicleLabel(result: SearchResultResponse | undefined): string {
  const vehicle = result?.vehicle;
  if (!vehicle) return 'Veículo';
  return [vehicle.brand, vehicle.model].filter(Boolean).join(' ') || 'Veículo';
}
